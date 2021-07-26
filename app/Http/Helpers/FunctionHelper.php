<?php

/**
 *  @param mixed $instance
 *  @param mixed $Inbound_id
 *  @return success true of false
 */
function findDataByInboundId($instance, $id)
{
  return $instance->where('Inbound_Id', $id)->firstOrFail();
}

/**
 * @param mixed $instance
 * @param array|String $inbound_ids 
 * @return array of Object
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
