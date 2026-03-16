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
        'and'   => 'where',
        'or'    => 'orWhere',
        'where' => 'where'
    ];

    protected $allowedFilterOperators = [
        'contains',
        'doesNotContain',
        'isEmpty',
        'isNotEmpty',
        'startswith',
        'endsWith',
        'is',
        'isnot',
        '=',
        '<>',
        '>',
        '<',
        'between',
        'dateBetween',
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
        if (is_array($val)) {
            $from = $val['from'] ?? null;
            $to = $val['to'] ?? null;
        } else {
            $from = $val->from ?? null;
            $to = $val->to ?? null;
        }

        if ($from !== null && $from !== '' && $to !== null && $to !== '') {
            return [[$field, '>=', $from], [$field, '<=', $to]];
        }

        return [];
    }

    protected function resolveCondType($groupName)
    {
        return in_array($groupName, ['and', 'or'], true) ? $groupName : 'and';
    }

    protected function decodeFilterPayload($rawFilterValue)
    {
        if (!$rawFilterValue) {
            return ['groupName' => 'and', 'items' => []];
        }

        $decoded = json_decode($rawFilterValue, true);
        if (!is_array($decoded)) {
            return ['groupName' => 'and', 'items' => []];
        }

        return [
            'groupName' => $decoded['groupName'] ?? 'and',
            'items' => isset($decoded['items']) && is_array($decoded['items']) ? $decoded['items'] : [],
        ];
    }

    protected function sanitizeFilterValue($operator, $value)
    {
        if ($operator === 'isEmpty' || $operator === 'isNotEmpty') {
            return '';
        }

        if ($operator === 'between' || $operator === 'dateBetween') {
            if (!is_array($value)) {
                return null;
            }

            $from = $value['from'] ?? null;
            $to = $value['to'] ?? null;
            if ($from === null || $from === '' || $to === null || $to === '') {
                return null;
            }

            return ['from' => $from, 'to' => $to];
        }

        if (is_array($value)) {
            $trimmedValues = [];
            foreach ($value as $item) {
                if (is_scalar($item) && trim((string)$item) !== '') {
                    $trimmedValues[] = $item;
                }
            }
            return $trimmedValues;
        }

        if ($value === null || $value === '') {
            return null;
        }

        return $value;
    }

    protected function sanitizeFilterCondition($condition, $allowedFields = [], $fieldMap = [])
    {
        if (!is_array($condition)) {
            return null;
        }

        $rawField = $condition['field'] ?? null;
        $operator = $condition['operator'] ?? null;
        $dataType = $condition['dataType'] ?? 'string';
        $value = $condition['value'] ?? null;

        if (!is_string($rawField) || !is_string($operator)) {
            return null;
        }

        if (!in_array($operator, $this->allowedFilterOperators, true)) {
            return null;
        }

        $field = $fieldMap[$rawField] ?? $rawField;
        if (!empty($allowedFields) && !in_array($field, $allowedFields, true)) {
            return null;
        }

        $sanitizedValue = $this->sanitizeFilterValue($operator, $value);
        if ($sanitizedValue === null) {
            return null;
        }

        return [
            'field' => $field,
            'operator' => $operator,
            'value' => $sanitizedValue,
            'dataType' => $dataType,
        ];
    }

    public function applyRingbaFilters($dataQuery, $rawFilterValue, $allowedFields = [], $fieldMap = [])
    {
        $filterPayload = $this->decodeFilterPayload($rawFilterValue);
        if (empty($filterPayload['items'])) {
            return $dataQuery;
        }

        $groupName = $this->resolveCondType($filterPayload['groupName']);
        foreach ($filterPayload['items'] as $condition) {
            $sanitizedCondition = $this->sanitizeFilterCondition($condition, $allowedFields, $fieldMap);
            if (!$sanitizedCondition) {
                continue;
            }

            $dataQuery->{$this->condTypes[$groupName]}(function ($q) use ($sanitizedCondition, $groupName) {
                $value = $sanitizedCondition['value'];
                if (is_array($value) && !isset($value['from']) && !isset($value['to'])) {
                    foreach ($value as $key => $currentValue) {
                        $this->RingbaMakeConditionQuery(
                            $q,
                            $groupName,
                            $sanitizedCondition['field'],
                            $sanitizedCondition['operator'],
                            $currentValue,
                            $sanitizedCondition['dataType'],
                            $key,
                            'array'
                        );
                    }
                    return;
                }

                $this->RingbaMakeConditionQuery(
                    $q,
                    $groupName,
                    $sanitizedCondition['field'],
                    $sanitizedCondition['operator'],
                    $value,
                    $sanitizedCondition['dataType'],
                    0,
                    ''
                );
            });
        }

        return $dataQuery;
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
        $condType = $this->resolveCondType($condType);

        if ($type !== '') {
            if ($val === null || $val === '') {
                return $dataQuery;
            }

            if ($valueIndx === 0) {
                return $dataQuery->where($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
            } else {
                return $dataQuery->orWhere($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
            }
        } else {
            if ($operator === 'isEmpty') {
                $method = $condType === 'or' ? 'orWhereNull' : 'whereNull';
                return $dataQuery->{$method}($field);
            } elseif ($operator === 'isNotEmpty') {
                $method = $condType === 'or' ? 'orWhereNotNull' : 'whereNotNull';
                return $dataQuery->{$method}($field);
            }

            if ($operator === 'between' || $operator === 'dateBetween') {
                $betweenQuery = $this->findBetweenQuery($field, $val, $dataType);
                if (!empty($betweenQuery)) {
                    return $dataQuery->{$this->condTypes[$condType]}($betweenQuery);
                }

                return $dataQuery;
            }

            if ($val === null || $val === '') {
                return $dataQuery;
            }

            return  $dataQuery->{$this->condTypes[$condType]}($field, $this->getSearchOperator($operator), $this->findValue($operator, $val));
        }
    }
}
