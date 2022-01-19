<?php

namespace App\Http\Helpers;

use App\Models\RingbaAuthDetails;
use App\Models\RingbaData;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class RingbaApiHelpers
{
    private $_username = 'mkokernak@buyottads.com';
    private $_password = 'Msk565656!';
    private $_grantType = 'password';
    private $_apiEndpoint = 'https://api.ringba.com/v2/';
    private $_auth_details;
    private $_account_details;
    private $_apiToken;

    public function __construct()
    {
        $ringbaAuthDetails = new RingbaAuthDetails();
        if ($ringbaAuthDetails->get()->first()) {
            // $apiResponse = $this->generateAccessToken();
            // $accessToken = json_decode($apiResponse);

            // $accountInfoApiResponse = $this->getAccountInfo($accessToken->access_token);
            // $res = json_decode($accountInfoApiResponse);

            // $ringbaAuthDetails->user_info = json_encode(['username' => $this->_username, 'password' => $this->_password]);
            // $ringbaAuthDetails->auth_details = $apiResponse;
            // $ringbaAuthDetails->account_details = json_encode($res->account[0]);
            // $ringbaAuthDetails->save();
            $data = $ringbaAuthDetails->first();
            // $this->_auth_details = json_decode($data->auth_details);
            $this->_account_details = json_decode($data->account_details);
            $this->_apiToken = json_decode($data->api_token);
        } else {
            return ['data not found'];
        }
    }

    // for generate Ringba Access Token
    // public function generateAccessToken()
    // {
    //   $apiEndpoint = $this->_apiEndpoint . '/token';

    //   $client = new Client(['headers' => ['content-type' => "application/x-www-form-urlencoded; charset=UTF-8"]]);
    //   try {
    //     $apiResponse = $client->post($apiEndpoint, [
    //       'form_params' => [
    //         'grant_type'  => $this->_grantType,
    //         'username'    => $this->_username,
    //         'password'    => $this->_password
    //       ]
    //     ]);
    //   } catch (RequestException $e) {
    //     return (string) $e->getResponse()->getBody();
    //   }
    //   return $apiResponse->getBody()->getContents();
    // }

    // for get request
    public function getRequest($method)
    {
        $apiEndpoint = $this->_apiEndpoint . "{$this->_account_details->accountId}/{$method}";

        $client = new Client(['headers' => ['Authorization' => "Token {$this->_apiToken->api_token}"]]);
        try {
            $apiResponse = $client->get($apiEndpoint);
        } catch (RequestException $e) {
            return (string) $e->getResponse()->getBody();
        }
        return $apiResponse->getBody()->getContents();
    }

    // for post request
    public function postRequest($method, $data)
    {
        $apiEndpoint = $this->_apiEndpoint . "{$this->_account_details->accountId}/{$method}";
        $client = new Client(['headers' => ['Authorization' => "Token {$this->_apiToken->api_token}"]]);
        try {
            $apiResponse = $client->post($apiEndpoint, ['json' => $data]);
        } catch (RequestException $e) {
            return (string) $e->getResponse()->getBody();
        }
        return $apiResponse->getBody()->getContents();
    }

    /**
     * @var mixed $past
     * @var mixed $days
     * @param mixed $past|$days
     * @return void
     */
    public function getRingbaData($past = 2, $days = 2)
    {
        $params = [
      'dateRange' => [
        'past' => $past,
        'days' => $days
      ],
      'timeSeries' => [
        'timeGroup' => 'hour'
      ],
      'callLog' => [
        'page' => 0,
        'pageSize' => 10000,
        'sort' => 'dtStamp',
        'sortDirection' => 'desc'
      ],
      'timezoneId' => 'Eastern Standard Time'
    ];

        $result = json_decode($this->postRequest('calllogs/date', $params));

        if ($result) {
            $ringbaData = new RingbaData();
            $ringbaData->truncate();
            foreach ($result->result->callLog->data as $data) {
                $ringbaData = new RingbaData();
                $ringbaData->columns = json_encode($data->columns);
                $ringbaData->events = json_encode($data->events);
                $ringbaData->tags = json_encode($data->tags);
                $ringbaData->save();
            }
            $response  = [
        'status' => 200,
        'msg' => 'Data Fetch Successfully'
      ];
        } else {
            $response  = [
        'status' => 400,
        'msg' => 'Server Error!'
      ];
        }
        return $response;
    }

    /**
     * @var mixed $inboundId
     * @param mixed $inboundId
     * @return Object
     */
    private function getDataById($inboundId)
    {
        $params = [
      'dateRange' => [
        'past' => 10000,
        'days' => 10001
      ],
      'timeSeries' => [
        'timeGroup' => 'hour'
      ],
      'callLog' => [
        'page' => 0,
        'pageSize' => 10000,
        'sort' => 'dtStamp',
        'sortDirection' => 'desc'
      ],
      'timezoneId' => 'Eastern Standard Time',
      "filters" => [
        [
          'key' => 'inboundCallId',
          'value' => $inboundId,
        ]
      ]
    ];

        $response =  json_decode($this->postRequest('calllogs/date', $params));
        return $response->result->callLog->data;
    }



    // private function getDataById($inboundId)
    // {

    //   $params = [
    //     "InboundCallIds" => $inboundId,
    //   ];

    //   $response =  json_decode($this->postRequest('calllogs/detail', $params));
    //   dd($response);
    //   return $response->result->callLog->data;
    // }

    /**
     * @for update Ringba call log
     * @param mixed $inboundId
     * @return Object
     */
    public function getUpdateData($inboundId)
    {
        $result =  $this->getDataById($inboundId);
        return $result[0];
    }

    // get update data by inboundId
    /**
     * @var mixed $inboundId
     * @param mixed $inboundId
     * @return array[annotation_tag,has_annotation]
     */
    public function getUpdateAnnotation($inboundId)
    {
        $data =  $this->getDataById($inboundId);
        $annotation_tag = '';
        $has_annotation = 'NO';

        foreach ($data as $d) {
            $hasTag = $d->tags;

            if (count($hasTag) > 0) {
                foreach ($hasTag as $tag) {
                    if ($tag->tagType === 'Annotations') {
                        $annotation_tag = $tag->tagName;
                        $has_annotation = 'Yes';
                    } else {
                        $annotation_tag = '';
                        $has_annotation = 'NO';
                    }
                }
            }
        }

        return [
      'annotation_tag' => $annotation_tag,
      'has_annotation' => $has_annotation
    ];
    }

    public function getDataDateWise($params)
    {
        return json_decode($this->postRequest('calllogs/date', $params));
    }

    // get user account infor
    // public function getAccountInfo($accessToken)
    // {
    //   $apiEndpoint = $this->_apiEndpoint . '/ringbaaccounts';

    //   $client = new Client(['headers' => ['Authorization' => "Bearer $accessToken"]]);
    //   try {
    //     $apiResponse = $client->get($apiEndpoint);
    //   } catch (RequestException $e) {
    //     return (string) $e->getResponse()->getBody();
    //   }
    //   return $apiResponse->getBody()->getContents();
    // }

    // for get call log name
    public function getCallLogName()
    {
        $result = json_decode($this->getRequest('calllogs/columns'));
        return $result->columns;
    }

    // call log tag
    public function getTags()
    {
        $result = json_decode($this->getRequest('calllogs/tags'));
        return $result->values;
    }

    // get all campaing
    public function getCampaigns()
    {
        $result = json_decode($this->getRequest('campaigns'));
        return $result->campaigns;
    }

    // get compaigns stats
    public function getCompaignsStats()
    {
        $result = json_decode($this->getRequest('stats'));
        return $result->campaigns;
    }
    // get compaigns get affiliate
    public function getAffiliate()
    {
        $result = json_decode($this->getRequest('Publishers'));
        return $result->publishers;
    }
    // get compaigns get affiliate
    public function getTargets()
    {
        $result = json_decode($this->getRequest('targets'));
        return $result->targets;
    }
    public function getCustomers()
    {
        $result = json_decode($this->getRequest('Buyers'));
        return $result->buyers;
    }
}
