import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment from 'moment';
import { Loading, LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public indicadores: Array<any> = [];
  public indicadoresLabels: Array<string> = [];

  public lineChartData: Array<any> = [];

  public lineChartLabels: Array<any> = [];

  public lineChartOptions: any = {
    responsive: true
  };

  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';
  public fechaDesde: string =   moment().add(-1, 'week').startOf('day').toDate().toISOString();
  public fechaHasta: string = moment().startOf('day').toDate().toISOString();

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {
    this.lineChartData.push({ data: [1, 3, 4], label: 'test', id: 33 });
  }

  presentLoading(msg: string): Loading {
    const loader = this.loadingCtrl.create({
      content: "Consultando indicadores...",
      duration: 3000
    });
    loader.present();

    return loader;
  }

  cancelLoading(item: Loading) {
    item.dismiss();
  }

  formatMomentDate (item: moment.Moment): string {
    return item.format('DD/MM/YYYY');
  }

  formatDate (item:string): string {
    return this.formatMomentDate(moment(item));
  }

  updateChartData(): void {
      var diff = moment(this.fechaHasta).diff(this.fechaDesde, 'days');
      this.lineChartLabels = [];

      for(var j = 0; j <= diff; j++) {
        this.lineChartLabels.push(this.formatMomentDate(moment(this.fechaDesde).startOf('day').add(j, 'days')));
      }

      var loadingItem = this.presentLoading('Cargando cotizaciones...');

      for(var i = 0; i < this.indicadores.length; i++) {
        this.getCotizaciones(this.lineChartData, this.indicadores[i]);
      }

      this.cancelLoading(loadingItem);
  };

  getCotizaciones(lineChartData: any, i: any): void {
    this.indicadoresDataProvider.getCotizaciones(i.id, this.fechaDesde, this.fechaHasta).subscribe((cotizacionesData: any) => {

      var valoresCotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
        return c.valorCotizacion;
      });

      var flt =_.filter(lineChartData, function(d){
        return d.id == i.id;
      });

      if(_.isEmpty(flt)) {
        lineChartData.push({data: valoresCotizaciones, label: i.nombre, id: i.id});
      }
      else {
        flt[0].data = valoresCotizaciones;
      }
    });
  }

  ionViewDidLoad() {
    var dataProvider = this.indicadoresDataProvider;

    this.lineChartLabels = [this.fechaDesde, this.fechaHasta];
    var loadingItem = this.presentLoading('Cargando indicadores...');

    dataProvider.getIndicadores().subscribe((indicadoresData: any) => {
      for(var i = 0; i < indicadoresData.items.length; i++) {
        this.indicadores.push(indicadoresData.items[i]);
      }

      this.cancelLoading(loadingItem);
    });
  }
}