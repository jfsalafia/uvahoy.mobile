import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
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
  ];

  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';
  public fechaDesde: string = moment().add(-7, 'days').startOf('day').toDate().toISOString();
  public fechaHasta: string = moment().startOf('day').toDate().toISOString();

  public variacionElegida: string = 'Diaria';
  public mode: string = "";
  public variaciones: Array<string> = ['Diaria', 'Mensual', 'Anual'];

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {
    this.lineChartData.push({ data: [], label: '', id: 1 });
  };

  presentLoading(): Loading {
    const loader = this.loadingCtrl.create({
      content: "Consultando indicadores..."
    });
    loader.present();

    return loader;
  }

  cancelLoading(item: Loading) {
    item.dismiss();
  }

  formatMomentDate(item: moment.Moment): string {
    return item.format('DD/MM/YYYY');
  }

  formatDate(item: string): string {
    return this.formatMomentDate(moment(item));
  }

  updateChartData(): void {
    let diff: number = 0;
    if (this.variacionElegida == 'Diaria') {
      diff = moment(this.fechaHasta).diff(this.fechaDesde, 'days');
    }
    else if (this.variacionElegida == 'Mensual') {
      diff = moment(this.fechaHasta).diff(this.fechaDesde, 'months');
    }
    else if (this.variacionElegida == 'Anual') {
      diff = moment(this.fechaHasta).diff(this.fechaDesde, 'years');
    }

    var fechas: Moment[] = [];

    for (var j = 0; j <= diff; j++) {

      if (this.variacionElegida == 'Diaria') {
        fechas.push(moment(this.fechaDesde).startOf('day').add(j, 'days'));
      }
      else if (this.variacionElegida == 'Mensual') {
        fechas.push(moment(this.fechaDesde).startOf('day').add(j, 'months'));
      }
      else if (this.variacionElegida == 'Anual') {
        fechas.push(moment(this.fechaDesde).startOf('day').add(j, 'years'));
      }
    }

    this.lineChartLabels = _.map(fechas, function (f: Moment) {
      return f.format('DD/MM/YYYY');
    });

    var loadingItem = this.presentLoading();

    this.getCotizaciones(this.indicadores, fechas);

    this.cancelLoading(loadingItem);
  };

  getCotizaciones(indicadores: any[], fechas: Moment[]): void {
    var f = _.map(fechas, function (f: Moment) {
      return f.format("MM/DD/YYYY");
    });

    var i = _.map(indicadores, function (i: any) {
      return i.id;
    });

    var lcdata = this.lineChartData;

    this.indicadoresDataProvider.getMultiIndicadorCotizaciones(i.join(), f.join()).subscribe((cotizacionesData: any) => {

      var cotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
        return {
          indicadorId: c.indicadorId,
          fechaHoraCotizacion: c.fechaHoraCotizacion,
          valorCotizacion: c.valorCotizacion
        };
      });

      for (var i = 0; i < this.lineChartData.length; i++) {
        lcdata[i].data = [];
        var indicadorId = this.lineChartData[i].id;

        var cots = _.filter(cotizaciones, function (c) {
          return c.indicadorId == indicadorId;
        });

        let clone = JSON.parse(JSON.stringify(this.lineChartData));

        var idx = _.filter(clone, function (c) {
          return c.id == indicadorId;
        });

        if (!_.isEmpty(idx)) {
          _.first(idx).data = _.map(cots, function (c) {
            return c.valorCotizacion;
          });
        }
        this.lineChartData = clone;
      }
    });
  }

  ionViewDidLoad() {

    var dataProvider = this.indicadoresDataProvider;
    this.mode = dataProvider.mode;

    this.lineChartLabels = [this.fechaDesde, this.fechaHasta];
    var loadingItem = this.presentLoading();

    dataProvider.getIndicadores().subscribe((indicadoresData: any) => {
      this.lineChartData = [];
      for (var i = 0; i < indicadoresData.items.length; i++) {
        this.indicadores.push(indicadoresData.items[i]);
        this.lineChartData.push({ data: [], label: indicadoresData.items[i].abreviatura, id: indicadoresData.items[i].id });
      }

      this.cancelLoading(loadingItem);
    });
  }
}
