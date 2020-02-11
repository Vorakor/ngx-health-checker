import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { BackEndErrorComponent } from './modals/back-end-error/back-end-error.component';
import { LostConnectionComponent } from './modals/lost-connection/lost-connection.component';
import { NgxHealthCheckerComponent } from './ngx-health-checker.component';
import { NgxHealthCheckerService } from './ngx-health-checker.service';

@NgModule({
    declarations: [NgxHealthCheckerComponent, BackEndErrorComponent, LostConnectionComponent],
    imports: [HttpClientModule],
    providers: [NgxHealthCheckerService],
    exports: [NgxHealthCheckerComponent],
})
export class NgxHealthCheckerModule {}
