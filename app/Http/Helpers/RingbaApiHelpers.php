<?php

namespace App\Http\Helpers;

use App\Models\RingbaAuthDetails;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class RingbaApiHelpers
{

  private $_username = 'mkokernak@buyottads.com';
  private $_password = 'Msk565656!';
  private $_grantType = 'password';
  private $_apiEndpoint = 'https://api.ringba.com/v2';
  private $_auth_details;
  private $_account_details;

  public function __construct()
  {
    $ringbaAuthDetails = new RingbaAuthDetails();
    if (empty($ringbaAuthDetails->get()->first())) {
      $apiResponse = $this->generateAccessToken();
      $accessToken = json_decode($apiResponse);

      $accountInfoApiResponse = $this->getAccountInfo($accessToken->access_token);
      $res = json_decode($accountInfoApiResponse);

      $ringbaAuthDetails->user_info = json_encode(['username' => $this->_username, 'password' => $this->_password]);
      $ringbaAuthDetails->auth_details = $apiResponse;
      $ringbaAuthDetails->account_details = json_encode($res->account[0]);
      $ringbaAuthDetails->save();
    } else {
      $data = $ringbaAuthDetails->first();
      $this->_auth_details = json_decode($data->auth_details);
      $this->_account_details = json_decode($data->account_details);
    }
  }

  // for generate Ringba Access Token
  public function generateAccessToken()
  {
    $apiEndpoint = $this->_apiEndpoint . '/token';

    $client = new Client(['headers' => ['content-type' => "application/x-www-form-urlencoded; charset=UTF-8"]]);
    try {
      $apiResponse = $client->post($apiEndpoint, [
        'form_params' => [
          'grant_type'  => $this->_grantType,
          'username'    => $this->_username,
          'password'    => $this->_password
        ]
      ]);
    } catch (RequestException $e) {
      return (string) $e->getResponse()->getBody();
    }
    return $apiResponse->getBody()->getContents();
  }

  // for get request
  public function getRequest($method)
  {
    $apiEndpoint = $this->_apiEndpoint . "{$this->_account_details->accountId}/{$method}";
    // dd($this->_auth_details->access_token);

    $client = new Client(['headers' => ['Authorization' => "Bearer {$this->_auth_details->access_token}"]]);
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
    $client = new Client(['headers' => ['content-type' => "application/x-www-form-urlencoded; charset=UTF-8"]]);
    try {
      $apiResponse = $client->post($apiEndpoint, [$data]);
    } catch (RequestException $e) {
      return (string) $e->getResponse()->getBody();
    }
    return $apiResponse->getBody()->getContents();
  }

  // get user account infor
  public function getAccountInfo($accessToken)
  {
    $apiEndpoint = $this->_apiEndpoint . '/ringbaaccounts';

    $client = new Client(['headers' => ['Authorization' => "Bearer $accessToken"]]);
    try {
      $apiResponse = $client->get($apiEndpoint);
    } catch (RequestException $e) {
      return (string) $e->getResponse()->getBody();
    }
    return $apiResponse->getBody()->getContents();
  }

  // for get call log name 
  public function getCollLogName()
  {
    return $this->getRequest('calllogs/columns');
  }

  // call log tag
  public function getTags()
  {
    return $this->getRequest('calllogs/tags');
  }

  // get all campaing
  public function getCampaings()
  {
    return $this->getRequest('campaigns');
  }

  public function token()
  {
    return [$this->_auth_details, $this->_account_details];
  }


}
