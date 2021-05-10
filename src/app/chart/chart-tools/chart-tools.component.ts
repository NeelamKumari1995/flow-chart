import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, PaletteComponent } from 'gojs-angular';

@Component({
  selector: 'app-chart-tools',
  templateUrl: './chart-tools.component.html',
  styleUrls: ['./chart-tools.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartToolsComponent implements OnInit {
  @ViewChild('contractPalette', { static: true }) contractPaletteComponent: PaletteComponent;

  palette: any;
  paletteDivClassName = 'contractPaletteDiv';
  skipsPaletteUpdate = false;
  paletteModelData = {};
  paletteLinkData: Array<go.ObjectData> = [];
  paletteNodeData: Array<go.ObjectData> = [
    {
      id: 1,
      name: 'Income',
      description: 'Contracts start here: specify the income coming in.',
      image: 'assets/img/dollar-sign.svg',
      fill: '#4876E6',
      userImg: 'assets/img/human-2.png',
      linkValue: '$35,000'
    }, {
      id: 2,
      name: 'Split Percentages',
      description: 'Specify Splits on Income.',
      image: 'assets/img/exchange-alt.svg',
      fill: '#47DCE6',
      userImg: 'assets/img/human-3.png',
      linkValue: '$35,000'
    }, {
      id: 3,
      name: 'Recoupable Advance',
      description: 'Specify advances and percent take until recouped.',
      image: 'assets/img/retweet.svg',
      fill: '#00DAB3',
      userImg: 'assets/img/human-4.png',
      linkValue: '$35,000'
    }];

  constructor() { }

  ngOnInit() { }

  initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    this.palette = $(go.Palette);

    const nodeConfig = $(go.Panel, 'Auto',
      $(go.Shape, 'RoundedRectangle',
        {
          parameter1: 15,
          width: 250,
          height: 78,
          margin: 0,
          fill: 'white', stroke: null,
          spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
        }, new go.Binding('fill', 'fill')
      ),
      $(go.Panel, { width: 251, margin: new go.Margin(0, 0, 10, 0) },
        $(go.Panel, 'Auto',
          { desiredSize: new go.Size(251, 75) },
          $(go.Shape, 'RoundedTopRectangle', { parameter1: 15, width: 251, height: 75, fill: 'white', stroke: null }),
          $(go.Panel, 'Table', { defaultAlignment: go.Spot.Left, width: 250 },
            $(go.Panel, 'Auto', {
              rowSpan: 2,
              margin: 15,
              row: 0,
              alignment: go.Spot.Center,
              width: 40
            }, $(go.Shape, 'RoundedRectangle', {
              parameter1: 10, fill: '#eeebeb', height: 40,
              width: 40, stroke: null
            }),
              $(go.Picture, {
                height: 15,
                width: 15,
              }, new go.Binding('source', 'image'))
            ),
            $(go.TextBlock, {
              text: 'verticalAlignment: Center',
              verticalAlignment: go.Spot.Center,
              background: 'white',
              font: 'bold 10pt sans-serif',
              row: 0,
              column: 1,
              isMultiline: true,
              width: 180,
              margin: new go.Margin(10, 5, 0, 0),
            }, new go.Binding('text', 'name').makeTwoWay()),
            $(go.TextBlock, {
              wrap: go.TextBlock.WrapFit,
              text: 'verticalAlignment: Center',
              verticalAlignment: go.Spot.Center,
              isMultiline: true,
              row: 1, column: 1,
              width: 180,
              margin: new go.Margin(0, 5, 0, 0),
            }, new go.Binding('text', 'description').makeTwoWay())
          )
        )
      )
    );

    this.palette.nodeTemplate = $(go.Node, 'Spot',
      { selectionAdorned: false, locationSpot: go.Spot.Center, isShadowed: true, shadowBlur: 5, shadowColor: '#dbdada' },
      nodeConfig);

    this.palette.model = $(go.GraphLinksModel, { linkKeyProperty: 'name' });
    return this.palette;
  }

  paletteModelChange(changes: go.IncrementalData) {
    this.skipsPaletteUpdate = true;
    this.paletteNodeData = DataSyncService.syncNodeData(changes, this.paletteNodeData);
    this.paletteLinkData = DataSyncService.syncLinkData(changes, this.paletteLinkData);
    this.paletteModelData = DataSyncService.syncModelData(changes, this.paletteModelData);
  }

}
