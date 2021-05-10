import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GojsAngularModule } from 'gojs-angular';

import { ChartComponent } from './chart.component';
import { ChartToolsComponent } from './chart-tools/chart-tools.component';
import { ChartDrawingComponent } from './chart-drawing/chart-drawing.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChartComponent,
    ChartToolsComponent,
    ChartDrawingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GojsAngularModule
  ],
  entryComponents: [
    ChartComponent,
    ChartToolsComponent,
    ChartDrawingComponent
  ],
  exports: [
    ChartComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ChartModule { }
