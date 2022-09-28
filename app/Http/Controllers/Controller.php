<?php
namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public $condTypes = [
        'and'   => 'Where',
        'or'    => 'orWhere',
        'where' => 'Where'
    ];

    public function getSearchOperator($operator)
    {
        switch ($operator) {
            case 'contains':
                return 'like';
            case 'doesNotContain':
                return 'NOT like';
            case 'isEmpty':
                return '=';
            case 'isNotEmpty':
                return '<>';
            case 'startswith':
                return 'like';
            case 'endsWith':
                return 'like';
            case 'is':
                return '=';
            case 'isnot':
                return '<>';
            case '=':
                return '=';
            case '<>':
                return '<>';
            case '>':
                return '>';
            case '<':
                return '<';
            default:
                return 'unknown operator';
        }
    }

    public function findValue($operator, $val)
    {
        switch ($operator) {
            case 'contains':
                return '%' . $val . '%';
            case 'doesNotContain':
                return '%' . $val . '%';
            case 'startswith':
                return $val . '%';
            case 'endsWith':
                return '%' . $val;
            case 'is':
                return $val;
            case 'isnot':
                return $val;
            case '=':
                return $val;
            case '<>':
                return $val;
            case '>':
                return $val;
            case '<':
                return $val;
            default:
                return 'unknown operator';
        }
    }

    public function findBetweenQuery($field, $val, $dataType)
    {
        if (isset($val->from) && isset($val->to)) {
            if ($dataType === 'date') {
                return [[$field, '>=', $val->from], [$field, '<=', $val->to]];
            } else {
                return [[$field, '>=', $val->from], [$field, '<=', $val->to]];
            }
        }
    }

    public function makeConditionQuery($dataQuery, $condType, $field, $operator, $val)
    {
        if ($operator === 'isEmpty') {
            return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), null);
        } elseif ($operator === 'isNotEmpty') {
            return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), null);
        }
        return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
    }

    public function RingbaMakeConditionQuery($dataQuery, $condType, $field, $operator, $val, $dataType, $valueIndx, $type)
    {
        if ($type !== '') {
            if ($valueIndx === 0) {
                return $dataQuery->where($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
            } else {
                return $dataQuery->orWhere($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
            }
        } else {
            if ($operator === 'isEmpty') {
                return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), null);
            } elseif ($operator === 'isNotEmpty') {
                return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), null);
            }

            if ($operator === 'between' || $operator === 'dateBetween') {
                return  $dataQuery->{$this->condTypes[$condType]}($this->findBetweenQuery($field, $val, $dataType));
            }
            return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
        }
    }
}
