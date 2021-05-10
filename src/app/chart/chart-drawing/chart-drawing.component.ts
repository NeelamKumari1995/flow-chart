import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataSyncService, DiagramComponent } from 'gojs-angular';
import * as go from 'gojs';

@Component({
  selector: 'app-chart-drawing',
  templateUrl: './chart-drawing.component.html',
  styleUrls: ['./chart-drawing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartDrawingComponent implements OnInit {
  @ViewChild('contractDiagram', { static: true }) public contractDiagramComponent: DiagramComponent;

  diagramDivClassName = 'contractDiagramDiv';
  diagramModelData = {};
  skipsDiagramUpdate = false;
  diagramNodeData: Array<go.ObjectData> = [];
  chart: any;

  diagramLinkData: Array<go.ObjectData> = [];
  selectedNode: go.Node | null = null;

  constructor() { }

  ngOnInit() { }

  initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    this.chart = $(go.Diagram, {
      layout:
        $(go.TreeLayout,
          {
            treeStyle: go.TreeLayout.StyleLastParents,
            arrangement: go.TreeLayout.ArrangementHorizontal,
            angle: 90,
            layerSpacing: 35,
            alternateAngle: 90,
            alternateLayerSpacing: 35,
            alternateAlignment: go.TreeLayout.AlignmentBus,
            alternateNodeSpacing: 20
          }),
      model: $(go.TreeModel),
      maxSelectionCount: 1,
      validCycle: go.Diagram.CycleDestinationTree,
      'undoManager.isEnabled': true
    });

    const makePort = (id: string, spot: go.Spot, allowDot = false) => {
      return $(go.Shape, 'Circle', {
        opacity: .5,
        fill: allowDot ? 'grey' : null, strokeWidth: 0, desiredSize: new go.Size(8, 8),
        portId: id, alignment: spot,
        fromLinkable: true, toLinkable: true
      });
    };

    function mayWorkFor(node1, node2) {
      if (!(node1 instanceof go.Node)) { return false; }  // must be a Node
      if (node1 === node2) { return false; }  // cannot work for yourself
      if (node2.isInTreeOf(node1)) { return false; }  // cannot work for someone who works for you
      return true;
    }

    const headerPanel = $(go.Panel, 'Auto', { defaultAlignment: go.Spot.Left, minSize: new go.Size(250, 40) },
      $(go.Shape, 'RoundedTopRectangle', { fill: 'white', stroke: null }, new go.Binding('fill', 'fill')),
      $(go.Panel, 'Horizontal', $(go.Picture, { margin: 10 }, new go.Binding('source', 'image')),
        $(go.TextBlock, {
          margin: 10,
          wrap: go.TextBlock.WrapFit,
          text: 'verticalAlignment: Center',
          verticalAlignment: go.Spot.Center,
          font: 'bold 10pt sans-serif',
          stroke: 'white'
        }, new go.Binding('text', 'name').makeTwoWay())
      )
    );

    const bodyPanel =
      $(go.Panel, 'Auto', { defaultAlignment: go.Spot.Left, width: 250, position: new go.Point(0, new go.Size(250, 40).height - 1) },
        $(go.Shape, 'RoundedBottomRectangle', { fill: 'white', stroke: null }),
        $(go.Panel, 'Auto', { width: 250 },
          $(go.Panel, 'Table', { defaultAlignment: go.Spot.Left, width: 250 },
            $(go.Picture, { margin: 10, row: 0, column: 0 }, new go.Binding('source', 'userImg')),
            $(go.TextBlock, {
              text: 'verticalAlignment: Center', verticalAlignment: go.Spot.Center,
              width: 180, height: 30, background: 'white', font: 'bold 10pt sans-serif', row: 0, column: 1
            }, new go.Binding('text', 'name').makeTwoWay()),
            $(go.TextBlock, {
              width: 250,
              wrap: go.TextBlock.WrapFit,
              text: 'verticalAlignment: Center',
              verticalAlignment: go.Spot.Center,
              margin: 10,
              isMultiline: true,
              row: 2, columnSpan: 2
            }, new go.Binding('text', 'description').makeTwoWay())
          )));

    const nodeEvents = {
      // handle dragging a Node onto a Node to (maybe) change the reporting relationship
      mouseDragEnter: (e, node: any, prev) => {
        const selnode = this.chart.selection.first();
        if (!mayWorkFor(selnode, node)) { return; }
        const shape = node.findObject('SHAPE');
        if (shape) {
          shape._prevFill = shape.fill;  // remember the original brush
          shape.fill = 'darkred';
        }
      },
      mouseDragLeave: (e, node: any, next) => {
        const shape = node.findObject('SHAPE');
        if (shape && shape._prevFill) {
          shape.fill = shape._prevFill;  // restore the original brush
        }
      },
      mouseDrop: (e, node: any) => {
        const selnode = this.chart.selection.first();  // assume just one Node in selection
        if (mayWorkFor(selnode, node)) {
          // find any existing link into the selected node
          const link = selnode.findTreeParentLink();
          if (link !== null) {  // reconnect any existing link
            link.fromNode = node;
          } else {  // else create a new link
            this.chart.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
          }
        }
      }
    };

    const nodeConfig = $(go.Panel, 'Auto', $(go.Shape, 'RoundedRectangle', {
      parameter1: 15,
      spot1: go.Spot.TopLeft,
      spot2: go.Spot.BottomRight,
      fromLinkable: true,
      toLinkable: true,
      cursor: 'pointer',
      name: 'SHAPE',
      stroke: null,
      fill: 'transparent',
      width: 250
    }, new go.Binding('stroke', 'isSelected', (s) => s ? 'dodgerblue' : null).ofObject()),
      $(go.Panel, { width: 250 }, headerPanel, bodyPanel));

    this.chart.nodeTemplate = $(go.Node, 'Spot',
      { selectionAdorned: false, locationSpot: go.Spot.Center }, nodeEvents, nodeConfig,
      new go.Binding('layerName', 'isSelected', (sel) => sel ? 'Foreground' : '').ofObject(),
      makePort('t', go.Spot.TopCenter),
      makePort('b', go.Spot.MiddleBottom, true)
    );

    this.chart.linkTemplate = $(go.Link, go.Link.Orthogonal,
      { corner: 5, relinkableFrom: true, relinkableTo: true },
      $(go.Shape, { strokeWidth: 1.5, stroke: 'grey' }),
      $(go.Shape, { toArrow: 'Standard', fill: 'grey', stroke: 'grey' }),
      $(go.Panel, 'Auto',  // this whole Panel is a link label
        $(go.Shape, 'RoundedRectangle', { fill: 'white', stroke: null }),
        $(go.TextBlock, { margin: 3, stroke: 'grey' },
          new go.Binding('text', 'linkValue'))
      )
    );

    document.getElementById('zoomSliderOut').addEventListener('click', () => {
      const elm: any = document.getElementById('zoomSliderRange');
      const minimun = elm.value;
      const shareminimun = Number(minimun);
      if ((shareminimun - 1) > 0) {
        this.chart.commandHandler.decreaseZoom();
        elm.value = shareminimun - 1;
      }
    });

    document.getElementById('zoomSliderIn').addEventListener('click', () => {
      const elm: any = document.getElementById('zoomSliderRange');
      const minimun = elm.value;
      const shareminimun = Number(minimun);
      if ((shareminimun + 1) <= 10) {
        this.chart.commandHandler.increaseZoom();
        elm.value = shareminimun + 1;
      }
    });

    document.getElementById('outputBtn').addEventListener('click', () => {
      console.log('Output : ', this.chart.model.toJson());
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      const theJSON = this.chart.model.toJson();
      const uri = `data:text/json;charset=UTF-8,${encodeURIComponent(theJSON)}`;
      const filename = `${new Date().toDateString()}_data.json`;
      const dwldLink = document.createElement('a');
      dwldLink.setAttribute('href', uri);
      dwldLink.setAttribute('download', filename);
      dwldLink.style.display = 'none';
      document.body.appendChild(dwldLink);
      dwldLink.click(); // simulate click
      document.body.removeChild(dwldLink);
    });

    return this.chart;
  }

  diagramModelChange(changes: go.IncrementalData) {
    this.skipsDiagramUpdate = true;
    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);
  }
}
