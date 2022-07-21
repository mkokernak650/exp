<?php

use inertia\inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MarketController;
use App\Http\Controllers\TargetController;
use App\Http\Controllers\WebFormController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AffiliateController;
use App\Http\Controllers\ExceptionController;
use App\Http\Controllers\TestTableController;
use App\Http\Controllers\AnnotationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ZipcodeDataController;
use App\Http\Controllers\TableDetailsController;
use App\Http\Controllers\TVHouseholdsController;
use App\Http\Controllers\BilledCallLogController;
use App\Http\Controllers\EcommerceSaleController;
use App\Http\Controllers\RingbaCallLogController;
use App\Http\Controllers\BroadCastMonthController;
use App\Http\Controllers\BroadCastWeeksController;
use App\Http\Controllers\ArchivedCallLogController;
use App\Http\Controllers\MarketExceptionController;
use App\Http\Controllers\ReportGeneratorController;
use App\Http\Controllers\EcommerceCampaignController;
use App\Http\Controllers\EcommerceAffiliateController;
use App\Http\Controllers\EcommerceReportController;
use App\Http\Controllers\PendingBillCallLogController;
use App\Http\Controllers\GenerateReportTargetController;
use App\Http\Controllers\GenerateReportAffiliateController;
use App\Http\Controllers\GenerateReportCallLengthController;
use App\Http\Controllers\GenerateReportDestinationController;
use App\Http\Controllers\ZipcodeByTelevisionMarketController;
use App\Http\Controllers\GenerateReportMarketTargetController;
use App\Http\Controllers\GenerateReportMarketExceptionController;
use App\Http\Controllers\SendMailController;

Route::middleware('auth')->group(function () {
    // Ringba Campaign
    Route::post('campaign-edit', [CampaignController::class, 'edit'])->name('campaign.edit');
    Route::post('campaign-delete', [CampaignController::class, 'delete'])->name('campaign.delete');
    Route::get('campaign-setting-form', [CampaignController::class, 'campaignSettingForm'])->name('campaign.setting.form');
    Route::post('campaign-setting-form', [CampaignController::class, 'campaignSettingUpdate'])->name('campaign.setting.update');
    Route::get('campaign-setting-report', [CampaignController::class, 'campaignSettingReport'])->name('campaign.setting.report');
    Route::get('campaign/{campaign}/annotations', [CampaignController::class, 'campaignAnnotations'])->name('campaign.annotations');
    Route::get('campaign/{campaign}/exceptions', [CampaignController::class, 'campaignExceptions'])->name('campaign.exceptions');
    Route::post('store-annotations-row-order', [CampaignController::class, 'storeAnnotationsRowOrder'])->name('store.annotations.row.order');

    // E-commerce affiliate
    Route::resource('ecommerce-affiliates', EcommerceAffiliateController::class)->except('show', 'edit');
    Route::post('ecommerce-affiliates/import', [EcommerceAffiliateController::class, 'import'])->name('ecommerce-affiliates.import');
    Route::post('ecommerce-affiliates/deleteSelected', [EcommerceAffiliateController::class, 'deleteSelected'])->name('ecommerce-affiliates.deleteSelected');

    // E-commerce sale
    Route::get('ecommerce-sales', [EcommerceSaleController::class, 'index'])->name('ecommerce-sales.index');
    Route::put('ecommerce-sales/update/{ecommerceSale}', [EcommerceSaleController::class, 'update'])->name('ecommerce-sales.update');
    Route::get('ecommerce-sales/import', [EcommerceSaleController::class, 'import'])->name('ecommerce-sales.import');
    Route::post('ecommerce-sales/import', [EcommerceSaleController::class, 'importStore'])->name('ecommerce-sales.importStore');
    Route::post('ecommerce-sales/deleteSelected', [EcommerceSaleController::class, 'deleteSelected'])->name('ecommerce-sales.deleteSelected');

    Route::get('reports/ecommerce', [EcommerceReportController::class, 'ecommerceReport'])->name('ecommerce.report');
    Route::post('reports/ecommerce/generate', [EcommerceReportController::class, 'ecommerceReportGenerate'])->name('ecommerce.report.generate');

    // E-commerce campaign
    Route::resource('ecommerce-campaigns', EcommerceCampaignController::class)->except('show', 'edit');
    Route::post('ecommerce-campaigns-status-update/{ecommerceCampaign}', [EcommerceCampaignController::class, 'statusUpdate'])->name('ecommerce-campaigns.status.update');
    Route::post('ecommerce-campaigns/deleteSelected', [EcommerceCampaignController::class, 'deleteSelected'])->name('ecommerce-campaigns.deleteSelected');
});

Route::get('/', [LoginController::class, 'showLoginform'])->name('login')->middleware('guest');
Route::post('/login', [LoginController::class, 'login'])->name('login.attempt')->middleware('guest');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::get('/get-customer', [RingbaCallLogController::class, 'getCustomer']);
Route::get('/home', [HomeController::class, 'index'])->name('home');
Route::post('/temp-ringba-data', [RingbaCallLogController::class, 'dateWiseData'])->name('temp-ringba-data');
Route::get('/temp-ringba-data', [RingbaCallLogController::class, 'tempRingbaData'])->name('tempringbadata');
Route::post('/temp-ringba-data-delete', [RingbaCallLogController::class, 'tempDataDelete'])->name('temp.ringba.data.delete');
Route::get('/temp-ringba-call-log', [RingbaCallLogController::class, 'ringbaCallLogs'])->name('ringbaCallLogs');
Route::get('/call-logs-report', [RingbaCallLogController::class, 'callLogsReport'])->name('call-logs-report');
Route::post('/call-logs-delete', [RingbaCallLogController::class, 'delete'])->name('call.logs.delete');
Route::post('/update-data', [RingbaCallLogController::class, 'updateByInboundIds'])->name('update.data');
Route::get('/delete-ringba-date', [RingbaCallLogController::class, 'delete'])->name('delete.ringba.date');
Route::post('/market-delete', [MarketController::class, 'delete']);

Route::get('/get-ringba-data', [RingbaCallLogController::class, 'getRingbaDataForm'])->name('get.ringbadata');
Route::post('/add-market-exception', [MarketExceptionController::class, 'addMarketException'])->name('add.market.exception');
Route::get('/market-exception-form', [MarketExceptionController::class, 'marketExceptionForm'])->name('market.exception.form');
Route::get('/market-exception-report', [MarketExceptionController::class, 'marketExceptionReport'])->name('market.exception.report');

Route::resource('annotation', AnnotationController::class)->except(['show', 'edit']);
Route::post('/annotation-delete', [AnnotationController::class, 'delete'])->name('annotation.delete');
Route::post('change-annotation/{tableName}', [RingbaCallLogController::class, 'changeAnnotation'])->name('change.annotation');

Route::post('/market-exception-edit', [MarketExceptionController::class, 'edit'])->name('market.exception.edit');
Route::post('/market-exception-delete', [MarketExceptionController::class, 'delete'])->name('market.exception.delete');
Route::get('/market-exception-export/{type}/{campaign?}', [MarketExceptionController::class, 'export'])->name('market.exception.export');
Route::post('/market-exception-import', [MarketExceptionController::class, 'import'])->name('market.exception.import');

Route::get('market-export/{type}', [MarketController::class, 'export'])->name('market.export');
Route::post('market-import', [MarketController::class, 'import'])->name('market.import');
Route::get('/market-data', function () {
    return inertia::render('Settings/Market');
})->name('market.data');

Route::get('/add-customer', [CustomerController::class, 'addCustomerForm'])->name('add.customer');
Route::get('/customer-report', [CustomerController::class, 'customerReport'])->name('customer.report');
Route::post('/store-customer', [CustomerController::class, 'storeCustomer'])->name('store.customer');
Route::post('/customer-delete', [CustomerController::class, 'delete'])->name('customer.delete');
Route::post('/customer-edit', [CustomerController::class, 'edit'])->name('customer.edit');
Route::post('/move-customer-archive', [CustomerController::class, 'moveArchive'])->name('move.customer.archive');
Route::post('/active-customer', [CustomerController::class, 'activeCustomer'])->name('active.customer');
Route::get('/archived-customers', [CustomerController::class, 'archivedCustomers'])->name('archived.customers');
Route::get('customer-export/{type}', [CustomerController::class, 'export'])->name('customer.export');

Route::get('/add-affiliate', [AffiliateController::class, 'addAffiliateForm'])->name('add.affiliate');
Route::post('/store-affiliate', [AffiliateController::class, 'storeAffiliate'])->name('store.affiliate');
Route::get('/affiliate-report', [AffiliateController::class, 'affiliateReport'])->name('affiliate.report');
Route::post('/affiliate-delete', [AffiliateController::class, 'delete'])->name('affiliate.delete');
Route::post('/affiliate-edit', [AffiliateController::class, 'edit'])->name('affiliate.edit');
Route::post('/move-affiliate-archive', [AffiliateController::class, 'moveArchive'])->name('move.affiliate.archive');
Route::post('/active-affiliate', [AffiliateController::class, 'activeAffiliate'])->name('active.affiliate');
Route::get('/archived-affiliates', [AffiliateController::class, 'archivedAffiliates'])->name('archived.affiliates');
Route::post('/archived', [ArchivedCallLogController::class, 'store'])->name('add.arichived.bill.call');
Route::get('/archived-call-log-report', [ArchivedCallLogController::class, 'index'])->name('archived-call-log-report');
Route::post('/archived-to-call-log', [ArchivedCallLogController::class, 'moveToCallLog'])->name('archived.to.call.log');
Route::post('/archive-delete', [ArchivedCallLogController::class, 'delete'])->name('archive.delete');

Route::post('/move-from-pending-bill-to-ringba-call-log', [PendingBillCallLogController::class, 'moveToCallLog'])->name('move.from.pending.bill.to.ringba.call.log');
Route::get('/pending-call-log-report', [PendingBillCallLogController::class, 'index'])->name('pending-call-log-report');
Route::post('/pending', [PendingBillCallLogController::class, 'store'])->name('add.pending.bill.call');
Route::post('/pending-delete', [PendingBillCallLogController::class, 'delete'])->name('pending.delete');
Route::post('/billed-call-log', [BilledCallLogController::class, 'store'])->name('store.bill.call.logs');

Route::get('/zipcode-television-market', [ZipcodeByTelevisionMarketController::class, 'index'])->name('zipcode.television.market');
Route::post('/zipcode-television-market-import', [ZipcodeByTelevisionMarketController::class, 'import'])->name('zipcode.television.market.import');
Route::get('/zipcode-television-market/{type}', [ZipcodeByTelevisionMarketController::class, 'export'])->name('zipcode.television.market.export');
Route::post('/zipcode-television-market-delete', [ZipcodeByTelevisionMarketController::class, 'delete'])->name('zipcode.television.market.delete');
Route::get('/zipcode-data', [ZipcodeDataController::class, 'index'])->name('zipcode.data');
Route::post('/zipcode-data-import', [ZipcodeDataController::class, 'import'])->name('zipcode.data.import');
Route::get('/zipcode-data-export/{type}', [ZipcodeDataController::class, 'export'])->name('zipcode.data.export');
Route::post('/zipcode-data-delete', [ZipcodeDataController::class, 'delete'])->name('zipcode.data.delete');
// Route::get('/pagination/{page}', [ZipcodeDataController::class, 'pagination']);

Route::get('/target-form', [TargetController::class, 'index'])->name('target.form');
Route::get('/target-report', [TargetController::class, 'TargetsReport'])->name('target.report');
Route::get('/target-names-report', [TargetController::class, 'TargetNamesReport'])->name('target_names.report');
Route::post('/add-target', [TargetController::class, 'addTarget'])->name('add.target');
Route::post('/target-delete', [TargetController::class, 'targetDelete'])->name('target.delete');
Route::post('/target-names-delete', [TargetController::class, 'targetNamesDelete'])->name('target_names.delete');
Route::post('/target-edit', [TargetController::class, 'targetEdit'])->name('target.edit');
Route::post('/target-name-edit', [TargetController::class, 'targetNamesEdit'])->name('target_name.edit');
Route::post('/target-status-update', [TargetController::class, 'targetStatusUpdate'])->name('target.status.update');
Route::post('/target-name-status-update', [TargetController::class, 'targetNamesStatusUpdate'])->name('target_names.status.update');
Route::post('/update-annotation', [RingbaCallLogController::class, 'getAnnotation'])->name('update.annotation');


Route::get('/billed-call-log-report', [BilledCallLogController::class, 'index'])->name('billed-call-log-report');
Route::get('billed-store', [BilledCallLogController::class, 'store'])->name('billed.store');
Route::get('/formPending', [BilledCallLogController::class, 'formPending']);
Route::post('/billed-get-annotation', [BilledCallLogController::class, 'getAnnotation'])->name('billed.get.annotation');
Route::post('/billed-delete', [BilledCallLogController::class, 'delete'])->name('billed.delete');
Route::get('/exceptions', [ExceptionController::class, 'index'])->name('get.exceptions');

Route::post('move-exception-to-arhived', [ExceptionController::class, 'moveToArhived'])->name('move.exception.to.arhived');
Route::post('move-exception-to-pending', [ExceptionController::class, 'moveToPending'])->name('move.exception.to.pending');

Route::post('/exception-get-annotation', [ExceptionController::class, 'getAnnotation'])->name('exception.get.annotation');
Route::post('/exception-delete', [ExceptionController::class, 'delete'])->name('exception.delete');
Route::post('/update-exception-report', [ExceptionController::class, 'updateExceptionReport'])->name('update.exception.report');

Route::get('/add-broadcast-month', [BroadCastMonthController::class, 'index'])->name('add.broadcast.month');
Route::post('/broadcast-month-store', [BroadCastMonthController::class, 'store'])->name('broadcast.month.store');
Route::get('/broadcast-month-report', [BroadCastMonthController::class, 'broadCastMonthReport'])->name('broadcast.month.report');
Route::post('/broadcast-month-delete', [BroadCastMonthController::class, 'delete'])->name('broadcast.month.delete');
Route::post('/broadcast-month-edit', [BroadCastMonthController::class, 'edit'])->name('broadcast.month.edit');
Route::post('/broadcast-month-status-update', [BroadCastMonthController::class, 'statusUpdate'])->name('broadcast.month.status.update');
Route::get('/add-broadcast-week', [BroadCastWeeksController::class, 'index'])->name('add.broadcast.week');
Route::post('/broadcast-week-store', [BroadCastWeeksController::class, 'store'])->name('broadcast.week.store');
Route::get('/broadcast-week-report', [BroadCastWeeksController::class, 'broadCastWeekReport'])->name('broadcast.week.report');
Route::post('/broadcast-week-delete', [BroadCastWeeksController::class, 'delete'])->name('broadcast.week.delete');
Route::post('/broadcast-week-edit', [BroadCastWeeksController::class, 'edit'])->name('broadcast.week.edit');
Route::post('/broadcast-week-status-update', [BroadCastWeeksController::class, 'statusUpdate'])->name('broadcast.week.status.update');

Route::get('/add-tv-households', [TVHouseholdsController::class, 'AddTvHouseholds'])->name('add.tv.households');
Route::post('/store-tv-households', [TVHouseholdsController::class, 'storeTVHouseholds'])->name('store.tv.households');
Route::get('/tv-households-report', [TVHouseholdsController::class, 'TVHouseholdsReport'])->name('tv.households.report');
Route::post('/tv-households-edit', [TVHouseholdsController::class, 'edit'])->name('tv.households.edit');
Route::post('/tv-households-delete', [TVHouseholdsController::class, 'delete'])->name('tv.households.delete');
Route::post('/tv-households-import', [TVHouseholdsController::class, 'import'])->name('tv.households.import');

Route::get('/generate-report-affiliate', [GenerateReportAffiliateController::class, 'GenerateReportAffiliateForm'])->name('generate.report.affiliate');
Route::get('/generate-report-target', [GenerateReportTargetController::class, 'GenerateReportTargetForm'])->name('generate.report.target');
Route::get('/generate-report-market-exception', [GenerateReportMarketExceptionController::class, 'GenerateReportMArketExceptionForm'])->name('generate.report.market.exception');
Route::get('/generate-report-market-target', [GenerateReportMarketTargetController::class, 'GenerateReportMarketTargetForm'])->name('generate.report.market.target');
Route::get('/generate-report-destination', [GenerateReportDestinationController::class, 'GenerateReportDestination'])->name('generate.report.destination');
Route::get('/generate-report-call-length', [GenerateReportCallLengthController::class, 'GenerateReportCallLengthForm'])->name('generate.report.call.length');

Route::get('/ka-table', [MarketExceptionController::class, 'test'])->name('ka.table');
Route::get('web-form', function () {
    return Inertia::render('WebForm');
});

Route::post('/web-form-store', [WebFormController::class, 'store'])->name('webform.store');
Route::get('/web-form-reports', [WebFormController::class, 'index'])->name('webform.reports');
Route::post('/web-form-reports-delete', [WebFormController::class, 'delete'])->name('webform.reports.delete');
Route::post('/affiliate-report-generator', [ReportGeneratorController::class, 'affiliateReport'])->name('affiliate.report.generator');
Route::post('/target-report-generator', [ReportGeneratorController::class, 'targetReport'])->name('target.report.generator');
Route::post('market-exception-report-generator', [ReportGeneratorController::class, 'marketExceptionReport'])->name('market.exception.report.generator');
Route::post('destination-report-generator', [ReportGeneratorController::class, 'destinationReport'])->name('destination.report.generator');
Route::post('/call-length-report-generator', [ReportGeneratorController::class, 'callLengthReport'])->name('call.length.report.generator');
Route::post('/market-target-report-generator', [ReportGeneratorController::class, 'marketTargetReport'])->name('market.target.report.generator');
Route::post('/calllogs-revenue-update', [RingbaCallLogController::class, 'updateRevenue'])->name('calllogs.revenue.update');
Route::post('/exception-revenue-update', [ExceptionController::class, 'updateRevenue'])->name('exception.revenue.update');
Route::post('/bill-Calllogs-revenue-update', [BilledCallLogController::class, 'updateRevenue'])->name('bill.calllogs.revenue.update');

Route::get('/get-call-logs-secheduler', [RingbaCallLogController::class, 'getCallLogsScheduler'])->name('get.call.log.secheduler');
Route::post('/add-table-details', [TableDetailsController::class, 'store'])->name('add.table.details');
Route::get('/get-table-details', [TableDetailsController::class, 'index'])->name('get.table.details');

Route::get('/test-table-reports', [TestTableController::class, 'index'])->name('test.table.reports');

Route::get('custom-filter', function () {
    return Inertia::render('CustomFilter');
});

Route::get('send-mail', [SendMailController::class,'SendMail'])->name('send.mail');
