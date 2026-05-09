<?php

namespace App\Services;

use App\Models\EmailLog;
use Carbon\Carbon;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Throwable;

class EmailLogger
{
    public static function logSent(MessageSent $event): void
    {
        try {
            $email = $event->message instanceof Email ? $event->message : null;
            if (!$email) {
                return;
            }

            $headerUserId = self::userIdFromHeaders($email);

            $mailableType = null;
            if (isset($event->data['__laravel_notification']) && is_string($event->data['__laravel_notification'])) {
                $mailableType = $event->data['__laravel_notification'];
            } elseif (isset($event->data['mailable']) && is_object($event->data['mailable'])) {
                $mailableType = get_class($event->data['mailable']);
            }

            EmailLog::create([
                'user_id' => self::resolveUserId($headerUserId),
                'type' => self::emailLogTypeFromHeaders($email) ?? self::resolveType($mailableType),
                'from' => self::firstAddress($email->getFrom()),
                'to' => self::addressList($email->getTo()),
                'subject' => $email->getSubject(),
                'attachment_names' => self::attachmentNames($email),
                'status' => EmailLog::STATUS_SENT,
                'error' => null,
                'sent_at' => Carbon::now(),
            ]);
        } catch (Throwable $e) {
            Log::warning('EmailLogger::logSent failed', ['message' => $e->getMessage()]);
        }
    }

    public static function logFailure(
        array $emails,
        ?string $subject,
        Throwable $exception,
        ?string $mailableType = null,
        ?int $userId = null,
        ?string $emailLogType = null
    ): void {
        try {
            EmailLog::create([
                'user_id' => self::resolveUserId($userId),
                'type' => $emailLogType ?? self::resolveType($mailableType),
                'from' => null,
                'to' => array_values(array_filter($emails)),
                'subject' => $subject,
                'attachment_names' => null,
                'status' => EmailLog::STATUS_FAILED,
                'error' => $exception->getMessage(),
                'sent_at' => null,
            ]);
        } catch (Throwable $e) {
            Log::warning('EmailLogger::logFailure failed', ['message' => $e->getMessage()]);
        }
    }

    public static function logQueueFailure(JobFailed $event): void
    {
        try {
            $payload = $event->job->payload();
            $displayName = $payload['displayName'] ?? null;
            $commandName = $payload['data']['commandName'] ?? null;

            if (
                $commandName !== 'Illuminate\\Notifications\\SendQueuedNotifications'
                && $commandName !== 'Illuminate\\Mail\\SendQueuedMailable'
            ) {
                return;
            }

            $recipients = [];
            $subject = null;
            $mailableType = $displayName;

            $rawCommand = $payload['data']['command'] ?? null;
            if (is_string($rawCommand)) {
                try {
                    $command = unserialize($rawCommand);
                    if (is_object($command)) {
                        if (isset($command->channels) && is_array($command->channels) && !in_array('mail', $command->channels, true)) {
                            return;
                        }
                        if (property_exists($command, 'notifiables')) {
                            $notifiables = $command->notifiables;
                            if (method_exists($notifiables, 'all')) {
                                $notifiables = $notifiables->all();
                            }
                            foreach ((array) $notifiables as $notifiable) {
                                if (is_object($notifiable) && method_exists($notifiable, 'routeNotificationFor')) {
                                    $route = $notifiable->routeNotificationFor('mail');
                                    if (is_string($route)) {
                                        $recipients[] = $route;
                                    } elseif (is_array($route)) {
                                        foreach ($route as $address) {
                                            if (is_string($address)) {
                                                $recipients[] = $address;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (isset($command->notification) && is_object($command->notification)) {
                            $mailableType = get_class($command->notification);
                        } elseif (isset($command->mailable) && is_object($command->mailable)) {
                            $mailableType = get_class($command->mailable);
                            if (property_exists($command->mailable, 'subject')) {
                                $subject = $command->mailable->subject;
                            }
                        }
                    }
                } catch (Throwable $unserializeError) {
                    // ignore unserialize errors and fall back to display name
                }
            }

            EmailLog::create([
                'user_id' => null,
                'type' => 'Queue Failure',
                'from' => null,
                'to' => array_values(array_unique(array_filter($recipients))),
                'subject' => $subject,
                'attachment_names' => null,
                'status' => EmailLog::STATUS_FAILED,
                'error' => $event->exception ? $event->exception->getMessage() : null,
                'sent_at' => null,
            ]);
        } catch (Throwable $e) {
            Log::warning('EmailLogger::logQueueFailure failed', ['message' => $e->getMessage()]);
        }
    }

    protected static function resolveUserId(?int $fallbackUserId = null): ?int
    {
        $authId = Auth::id();
        if ($authId) {
            return (int) $authId;
        }

        if ($fallbackUserId !== null) {
            return (int) $fallbackUserId;
        }

        return null;
    }

    protected static function emailLogTypeFromHeaders(Email $email): ?string
    {
        try {
            $header = $email->getHeaders()->get('X-Consumerexp-Email-Log-Type');
            if (!$header) {
                return null;
            }

            $raw = null;
            if (method_exists($header, 'getBodyAsString')) {
                $raw = $header->getBodyAsString();
            } elseif (method_exists($header, 'getBody')) {
                $raw = $header->getBody();
            } else {
                $raw = (string) $header;
            }

            $raw = is_string($raw) ? trim($raw) : '';

            return $raw !== '' ? $raw : null;
        } catch (Throwable $e) {
            return null;
        }
    }

    protected static function userIdFromHeaders(Email $email): ?int
    {
        try {
            $header = $email->getHeaders()->get('X-Consumerexp-User-Id');
            if (!$header) {
                return null;
            }

            $raw = null;
            if (method_exists($header, 'getBodyAsString')) {
                $raw = $header->getBodyAsString();
            } elseif (method_exists($header, 'getBody')) {
                $raw = $header->getBody();
            } else {
                $raw = (string) $header;
            }

            return is_numeric($raw) ? (int) $raw : null;
        } catch (Throwable $e) {
            return null;
        }
    }

    protected static function resolveType(?string $mailableType = null): ?string
    {
        if ($mailableType === 'App\\Notifications\\CustomEmail') {
            return 'Custom Email';
        }

        if ($mailableType === 'App\\Notifications\\SendMail') {
            return 'Send Mail';
        }


        return null;
    }

    protected static function addressList(?array $addresses): array
    {
        if (empty($addresses)) {
            return [];
        }
        $result = [];
        foreach ($addresses as $address) {
            if ($address instanceof Address) {
                $result[] = $address->getAddress();
            } elseif (is_string($address)) {
                $result[] = $address;
            }
        }
        return array_values(array_filter($result));
    }

    protected static function firstAddress(?array $addresses): ?string
    {
        $list = self::addressList($addresses);
        return $list[0] ?? null;
    }

    protected static function attachmentNames(Email $email): array
    {
        $names = [];
        try {
            foreach ($email->getAttachments() as $attachment) {
                $name = null;
                if (method_exists($attachment, 'getFilename')) {
                    $name = $attachment->getFilename();
                }
                if (!$name && method_exists($attachment, 'getPreparedHeaders')) {
                    $headers = $attachment->getPreparedHeaders();
                    $disposition = $headers->get('content-disposition');
                    if ($disposition && method_exists($disposition, 'getParameter')) {
                        $name = $disposition->getParameter('filename') ?: $disposition->getParameter('name');
                    }
                }
                if ($name) {
                    $names[] = $name;
                }
            }
        } catch (Throwable $e) {
            // ignore - attachment introspection is best-effort
        }
        return $names;
    }
}
