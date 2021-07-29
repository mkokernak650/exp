<?php

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
