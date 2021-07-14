<?php

/**
 *  @param instance
 *  @param Inbound_id
 *  @return success true of false
 */
function findDataByInboundId($instance, $id)
{
  return $instance->where('Inbound_Id', $id)->first();
}
