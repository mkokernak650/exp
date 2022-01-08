<?php

use Carbon\Carbon;

if (!function_exists('findDataByInboundId')) {

  /**
   *  @param mixed $instance
   *  @param mixed $Inbound_id
   *  @return object
   */
  function findDataByInboundId($instance, $id)
  {
    return $instance->where('Inbound_Id', $id)->first();
  }
}


if (!function_exists('deleteRecords')) {

  /**
   * @param mixed $instance
   * @param array|String $inbound_ids
   * @return true
   */
  function deleteRecords($instance, $inbound_ids)
  {
    $i = 0;
    // $data = [];
    if (is_array($inbound_ids)) {
      while ($i < count($inbound_ids)) {
        $data = findDataByInboundId($instance, $inbound_ids[$i]);
        $data->delete();
        $i++;
      }
    } else {
      $data = findDataByInboundId($instance, $inbound_ids);
      $data->delete();
    }

    return true;
  }
}

if (!function_exists('varDump')) {
  function varDump($data)
  {
    echo '<pre>';
    var_dump($data);
    echo '</pre>';
  }
}

if (!function_exists('dataMoveHelper')) {
  function dataMoveHelper($to_instance, $from_instance)
  {
    $fields = [
      'SN', 'Call_Date_Time', 'Call_Date', 'Duplicate_Call', 'Campaign',
      'Campaign_Id', 'Affiliate', 'Affiliate_Id', 'Inbound', 'Inbound_Id', 'Dialed',
      'Time_To_Call', 'Account_Id', 'Total_Cost', 'payoutAmount', 'Conn_Duration',
      'call_Length_In_Seconds', 'Profit', 'Target', 'Target_Number', 'Target_Description', 'Revenue',
      'Source_Hangup', 'City', 'State', 'Zipcode', 'Market', 'Type', 'Call_Qualification',
      'Recording_Url', 'Customer', 'Has_Annotation', 'Annotation_Tag'
    ];
    $i = 0;
    while ($i < count($fields)) {
      if ($to_instance->{$fields[$i]} === 'Call_Date') {
        $to_instance->{$fields[$i]} = $from_instance->{dateFormat($fields[$i])};
      }
      $to_instance->{$fields[$i]} = $from_instance->{$fields[$i]};
      $i++;
    }
    $to_instance->save();
    $from_instance->delete();
    return true;
  }
}

if (!function_exists('deleteSuccessOrFailed')) {
  /**
   * @param $result true|false
   * @param Array $success['msg', status_code]
   * @param Array $failed['msg', status_code]
   * @return response json
   */
  function deleteSuccessOrFailed($result, $success = [], $failed = [])
  {
    if ($result) {
      return response()->json(["msg" => $success['msg'] || "Successfully Deleted", "status_code" => $success['status_code'] || 200]);
    } else {
      return response()->json(["msg" => $failed['msg'] || "Deleting Failed", "status_code" => $failed['status_code'] || 500]);
    }
  }
}

if (!function_exists('dateFormat')) {
  /**
   * @param $date
   * @return Date('Y-m-d')
   */
  function dateFormat($date)
  {
    return Carbon::parse($date)->format('Y-m-d');
  }
}

if (!function_exists('secondToMinutes')) {
  /**
   * @param $seconds
   * @return Minutes
   */
  function secondToMinutes($seconds)
  {
    return sprintf("%02.2d:%02.2d", floor($seconds / 60), $seconds % 60);
  }
}
