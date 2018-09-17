import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash';
import moment, { Moment } from 'moment';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
    { data: [], label: 'UVA', id: 1 }, 
    { data: [], label: 'Dolar', id: 3 }
  ];

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  getFechas(): Moment[] {
    const cantidad = 5;
    var items: Moment[]=[];

    for(var i = cantidad ; i >= 0; i--) {
       items.push(moment().add(-1*i,'months').startOf('month'));
    }
    return items;
  };

  getCotizaciones(): void {
    var ids = _.map (this.barChartData, function(d) {
      return d.id;
    });

    var fechas = _.map(this.getFechas(), function(f) {
        return f.format("MM/DD/YYYY");
    });

    var bcdata = this.barChartData;
    
    this.indicadoresDataProvider.getMultiIndicadorCotizaciones(ids.join(), fechas.join()).subscribe((cotizacionesData: any) => {
      for(var i = 0; i < this.barChartData.length; i++) {
        bcdata[i].data = [];
        var indicadorId = this.barChartData[i].id;
        
        var cots = _.filter(cotizacionesData.cotizaciones, function(c) {
            return c.indicadorId == indicadorId;
        });

        let clone = JSON.parse(JSON.stringify(this.barChartData));
        var idx = _.filter(clone, function(c){
            return c.id == indicadorId;
        });

        if(!_.isEmpty(idx)) {
          _.first(idx).data = _.map(cots, function (c) {
                return c.valorCotizacion;
          });
        }
       
        this.barChartData = clone;
      }     
    });

  }

  public randomize(): void {
    this.getCotizaciones();
  }

  constructor(public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

   var labels = _.map(this.getFechas(), function(f) {
      return f.format('DD/MM/YYYY'); 
   });
  
   this.barChartLabels = [].concat(labels);
  }

}
