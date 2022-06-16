<?php
namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;

class ReportExport implements WithHeadings, FromCollection, WithStyles, ShouldAutoSize, WithEvents
{
    protected $sheetData;
    protected $headings;
    protected $callSummary;
    protected $tagData;
    public function __construct($data, $callSummary, $tagData, $columns)
    {
        $this->sheetData = $data;
        $this->headings = $columns;
        $this->callSummary=$callSummary;
        $this->tagData=$tagData;
    }


    public function collection()
    {
        return $this->sheetData;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true,'size' => 12]],
        ];
    }

    public function registerEvents(): array
    {
        return[ AfterSheet::class => function (AfterSheet $event) {
            foreach ($this->callSummary as $key=>$value) {
                $event->sheet->appendRows(array(array(
                    $key,$value
                )), $event);
            }
     
            $event->sheet->getDelegate();
        }
    ];
    }
}
