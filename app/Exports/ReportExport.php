<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;

class ReportExport implements WithHeadings, FromCollection, WithStyles, ShouldAutoSize, WithEvents
{
    protected $sheetData;
    protected $headings;
    protected $callSummary;
    protected $tagData;
    protected $header;

    public function __construct($data, $callSummary, $tagData, $header)
    {
        $this->header      = $header;
        $this->headings    = isset($data[0]) ? array_keys((array)$data[0]) : [];
        $this->sheetData   = $data;
        $this->callSummary = $callSummary;
        $this->tagData     = $tagData;
    }

    public function collection()
    {
        return $this->sheetData;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function styles(Worksheet $sheet): array
    {
        if (count($this->headings) < 1) {
            return [];
        }

        if (!empty($this->header)) {
            $rowNo = count($this->header) + 2;
        } else {
            $rowNo = 1;
        }

        return [
            $rowNo => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function registerEvents(): array
    {
        if (!empty($this->header)) {
            $events[BeforeSheet::class] = function (BeforeSheet $event) {
                foreach ($this->header as $key => $header) {
                    $data[] = [$key, $header];
                }

                $data[] = [' ', ' '];

                $event->sheet->getDelegate()->fromArray($data, null, 'A1', false);
            };
        }

        if (!empty($this->callSummary)) {
            $events[AfterSheet::class] = function (AfterSheet $event) {
                for ($i = 0; $i < 3; $i++) {
                    $event->sheet->appendRows([[' ', ' ']], $event);
                }

                foreach ($this->callSummary as $key => $value) {
                    $event->sheet->appendRows([[$key, (string)$value]], $event);
                }

                $event->sheet->getDelegate();
            };
        }

        if (!empty($this->header) || !empty($this->callSummary)) {
            return $events;
        } else {
            return [];
        }
    }
}
