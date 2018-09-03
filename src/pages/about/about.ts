import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };


  public barChartLabels:string[] = ['01/2018', '02/2018', '03/2018', '04/2018', '05/2018', '06/2018', '07/2018','08/2018'];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
  
  public barChartData:any[] = [
    {data: [65, 59, 80, 81, 56, 55, 40, 40], label: 'Dolar'},
    {data: [28, 48, 40, 19, 86, 27, 90, 90], label: 'UVA'}
  ];
  
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
  
  public chartHovered(e:any):void {
    console.log(e);
  }
  
  getCotizaciones(data:any, i: any): void {
    this.indicadoresDataProvider.getCotizaciones(i.id, '01/01/2018', '01/08/2018').subscribe((cotizacionesData: any) => {

      var valoresCotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
        return c.valorCotizacion;
      });

      data.push({label: i.id, data : valoresCotizaciones});
    });
  }

  public randomize():void {

    
    // Only Change 3 values
    let data = [];
    this.getCotizaciones(data, {id: 1});

    this.getCotizaciones(data, {id: 2});

    let clone = JSON.parse(JSON.stringify(this.barChartData));
    clone[0].data = data;
    this.barChartData = clone;
    /**
     * (My guess), for Angular to recognize the change in the dataset
     * it has to change the dataset variable directly,
     * so one way around it, is to clone the data, change it and then
     * assign it;
     */
  }
  
  constructor(public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

  }

}
