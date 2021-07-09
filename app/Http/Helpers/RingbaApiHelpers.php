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

  public function getRingbaData()
  {
    $params = [
      'dateRange' => [
        'past' => 2,
        'days' => 2
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
    $data = [];
    $ringbaData = new RingbaData();
    $ringbaData->truncate();
    foreach ($result->result->callLog->data as $data) {
      $ringbaData = new RingbaData();
      $ringbaData->columns = json_encode($data->columns);
      $ringbaData->events = json_encode($data->events);
      $ringbaData->tags = json_encode($data->tags);
      $ringbaData->save();
    }
    return ['success'];
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
}
