<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;

class ReportTableSort
{
    /** Ringba-style call log / exception columns often stored as strings. */
    public const RINGBA_NUMERIC_SORT_COLUMNS = [
        'SN',
        'Inbound_Id',
        'Time_To_Call',
        'call_Length_In_Seconds',
        'Revenue',
        'Conn_Duration',
        'payoutAmount',
        'Total_Cost',
        'Profit',
    ];

    /**
     * @param  array<string>  $sortableColumns  Whitelist of DB column names (after any UI→DB map).
     * @param  array<string>  $numericStringColumns  Subset of $sortableColumns to order numerically.
     * @param  string|null  $table  Table name without backticks (e.g. ecommerce_sales); null = unqualified column.
     */
    public static function apply(
        Builder|QueryBuilder $query,
        string $dbSortField,
        string $sortOrder,
        array $sortableColumns,
        array $numericStringColumns,
        ?string $table = null
    ): void {
        if ($dbSortField === '' || ! in_array($dbSortField, $sortableColumns, true)) {
            return;
        }

        $dir = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
        $dirSql = strtoupper($dir);

        if (in_array($dbSortField, $numericStringColumns, true)) {
            $colSql = self::qualifiedColumnSql($table, $dbSortField);
            // Strip thousands separators / currency so CAST is not truncated at the first comma.
            $normalized = "TRIM(REPLACE(REPLACE({$colSql}, ',', ''), '$', ''))";
            $query->orderByRaw("CAST({$normalized} AS DECIMAL(22, 8)) {$dirSql}");

            return;
        }

        if ($table !== null) {
            $query->orderBy($table.'.'.$dbSortField, $dir);
        } else {
            $query->orderBy($dbSortField, $dir);
        }
    }

    private static function qualifiedColumnSql(?string $table, string $column): string
    {
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $column)) {
            throw new \InvalidArgumentException('Invalid sort column identifier.');
        }
        $col = '`'.str_replace('`', '', $column).'`';
        if ($table === null || $table === '') {
            return $col;
        }
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
            throw new \InvalidArgumentException('Invalid sort table identifier.');
        }

        return '`'.str_replace('`', '', $table).'`.'.$col;
    }

    /**
     * Sort by inclusive day count between two date columns (virtual "days_count" in UI).
     */
    public static function orderByDateRangeDayCount(
        Builder|QueryBuilder $query,
        string $sortOrder,
        string $startColumn = 'start_date',
        string $endColumn = 'end_date'
    ): void {
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $startColumn) || ! preg_match('/^[a-zA-Z0-9_]+$/', $endColumn)) {
            throw new \InvalidArgumentException('Invalid date column identifier for day-count sort.');
        }
        $dirSql = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';
        $start = '`'.str_replace('`', '', $startColumn).'`';
        $end = '`'.str_replace('`', '', $endColumn).'`';
        $query->orderByRaw("(DATEDIFF({$end}, {$start}) + 1) {$dirSql}");
    }

    /**
     * CAST a single-column identifier (e.g. subquery alias) to DECIMAL for numeric ordering.
     * Use only for known-safe identifiers (whitelist at call site).
     */
    public static function orderByCastDecimalColumn(
        Builder|QueryBuilder $query,
        string $column,
        string $sortOrder
    ): void {
        $colSql = self::qualifiedColumnSql(null, $column);
        $dirSql = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';
        $query->orderByRaw("CAST({$colSql} AS DECIMAL(22, 8)) {$dirSql}");
    }
}
