<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\BroadcastGroupName;
use App\Models\MsoName;
use App\Models\NetworkName;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Union picker + resolver for the three corporation entities:
 *   broadcast groups, MSOs, networks.
 *
 * The three tables are not merged — they keep their own identities.
 * This service unions them at query time for UI pickers and resolves
 * "all affiliates of corporation X" via the polymorphic affiliate_corporation pivot.
 */
class CorporationService
{
    public const TYPE_BROADCAST_GROUP = 'broadcast_group';
    public const TYPE_MSO             = 'mso';
    public const TYPE_NETWORK         = 'network';

    public const TYPE_TO_MODEL = [
        self::TYPE_BROADCAST_GROUP => BroadcastGroupName::class,
        self::TYPE_MSO             => MsoName::class,
        self::TYPE_NETWORK         => NetworkName::class,
    ];

    public const TYPE_TO_LABEL = [
        self::TYPE_BROADCAST_GROUP => 'Broadcast Groups',
        self::TYPE_MSO             => 'MSOs',
        self::TYPE_NETWORK         => 'Networks',
    ];

    public const TYPE_TO_NAME_COLUMN = [
        self::TYPE_BROADCAST_GROUP => 'broadcast_group_name',
        self::TYPE_MSO             => 'mso_name',
        self::TYPE_NETWORK         => 'network_name',
    ];

    /**
     * Flat union list of all corporations across the 3 tables, grouped by type.
     * Used for the picker dropdown.
     *
     * @return array<int, array{type: string, type_label: string, id: int, name: string}>
     */
    public function all(bool $activeOnly = true): array
    {
        $rows = [];
        foreach (self::TYPE_TO_MODEL as $type => $modelClass) {
            $nameCol = self::TYPE_TO_NAME_COLUMN[$type];
            $query = $modelClass::query()->select(['id', $nameCol]);
            if ($activeOnly) {
                $query->active();
            }
            foreach ($query->orderBy($nameCol)->get() as $row) {
                $rows[] = [
                    'type'       => $type,
                    'type_label' => self::TYPE_TO_LABEL[$type],
                    'id'         => $row->id,
                    'name'       => $row->{$nameCol},
                ];
            }
        }
        return $rows;
    }

    /**
     * Resolve "all affiliate ids linked to corporation(type, id)".
     *
     * @return Collection<int, int>
     */
    public function affiliateIdsOf(string $type, int $id): Collection
    {
        $corp = $this->find($type, $id);
        if (!$corp) {
            return collect();
        }
        return $corp->affiliates()->pluck('affiliates.id');
    }

    /**
     * Resolve "all affiliate models linked to corporation(type, id)".
     */
    public function affiliatesOf(string $type, int $id, bool $activeOnly = true): Collection
    {
        $corp = $this->find($type, $id);
        if (!$corp) {
            return collect();
        }
        $rel = $corp->affiliates();
        if ($activeOnly) {
            $rel->where('affiliates.status', 1);
        }
        return $rel->orderBy('affiliates.affiliate_name')->get();
    }

    /**
     * Expand an IO/report selection into a final affiliate id list.
     *
     * Inputs:
     *   $selection = [
     *     'corporation_type'        => 'broadcast_group'|'mso'|'network'|null,
     *     'corporation_id'          => int|null,
     *     'apply_to_all_affiliates' => bool,   // checkbox state
     *     'affiliate_ids'           => int[]|null, // selected when checkbox unchecked
     *   ]
     *
     * @return Collection<int, int> affiliate IDs to scope queries by
     */
    public function resolveSelection(array $selection): Collection
    {
        $type  = $selection['corporation_type']        ?? null;
        $id    = $selection['corporation_id']          ?? null;
        $all   = (bool) ($selection['apply_to_all_affiliates'] ?? false);
        $picks = collect($selection['affiliate_ids']   ?? [])->map(fn($v) => (int) $v);

        if (!$type || !$id) {
            return $picks; // no corporation chosen → use raw affiliate picks
        }

        if ($all) {
            return $this->affiliateIdsOf($type, $id);
        }

        // Some affiliates of this corp — intersect picks with corp's affiliate set
        $corpAffiliateIds = $this->affiliateIdsOf($type, $id);
        return $picks->intersect($corpAffiliateIds)->values();
    }

    /**
     * Attach an Affiliate to a corporation (idempotent).
     */
    public function attach(Affiliate $affiliate, string $type, int $id): void
    {
        $corp = $this->find($type, $id);
        if (!$corp) {
            return;
        }
        $corp->affiliates()->syncWithoutDetaching([$affiliate->id]);
    }

    /**
     * Detach an Affiliate from a corporation.
     */
    public function detach(Affiliate $affiliate, string $type, int $id): void
    {
        $corp = $this->find($type, $id);
        if (!$corp) {
            return;
        }
        $corp->affiliates()->detach($affiliate->id);
    }

    /**
     * List corporations of every type that a given Affiliate belongs to.
     *
     * @return array<int, array{type: string, type_label: string, id: int, name: string}>
     */
    public function corporationsOfAffiliate(Affiliate $affiliate): array
    {
        $out = [];
        foreach ([
            self::TYPE_BROADCAST_GROUP => $affiliate->broadcastGroups,
            self::TYPE_MSO             => $affiliate->msos,
            self::TYPE_NETWORK         => $affiliate->networks,
        ] as $type => $collection) {
            $nameCol = self::TYPE_TO_NAME_COLUMN[$type];
            foreach ($collection as $row) {
                $out[] = [
                    'type'       => $type,
                    'type_label' => self::TYPE_TO_LABEL[$type],
                    'id'         => $row->id,
                    'name'       => $row->{$nameCol},
                ];
            }
        }
        return $out;
    }

    protected function find(string $type, int $id): ?Model
    {
        $cls = self::TYPE_TO_MODEL[$type] ?? null;
        if (!$cls) {
            return null;
        }
        return $cls::find($id);
    }
}
