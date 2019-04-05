import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
import { Loading, LoadingController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

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
  

  getFechaDesde(variacion: string, fechaHasta: moment.Moment): Moment {
    let fechaDesde: moment.Moment = fechaHasta;

    if (variacion == 'Diaria') {
      fechaDesde = fechaHasta.add(-1, 'day').startOf('day');
    }
    else if (variacion == 'Semanal') {
      fechaDesde = fechaHasta.add(-1, 'week').startOf('day');
    }
    else if (variacion == 'Mensual') {
      fechaDesde = fechaHasta.add(-1, 'month').startOf('day');
    }
    else if (variacion == 'Anual') {
      fechaDesde = fechaHasta.add(-1, 'year').startOf('day');
    }
    else if (variacion == 'Trimestral') {
      fechaDesde = fechaHasta.add(-3, 'month').startOf('day');
    }
    else if (variacion == 'Semestral') {
      fechaDesde = fechaHasta.add(-6, 'month').startOf('day');
    }
    return fechaDesde;
  }
  public variacionElegida: string = 'Trimestral';

  private fh: Moment =  moment();

  public fechaMaxima: string = moment().format('YYYY-MM-DD');

  public fechaHasta: string = this.fh.toDate().toISOString();
  public fechaDesde: string =  this.getFechaDesde(this.variacionElegida, this.fh).toDate().toISOString();

  public mode: string = "";
  public variaciones: Array<string> = ['Diaria', 'Semanal', 'Mensual', 'Trimestral','Semestral', 'Anual'];
  public version : string = "";

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData, private appVersion: AppVersion) {
    this.lineChartData.push({ data: [], label: 'Indicador', id: 1 });
    
    this.appVersion.getVersionNumber().then(function(v){
        this.version = v;
    });
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

  getIntervalos(variacion: string): Moment[] {

    var intervalos: Moment[] = [];
    var duration: moment.DurationInputArg2;

    if (variacion == 'Diaria') {
      duration = 'days';
    }
    else if (variacion == 'Semanal') {
      duration = 'days';
    }
    else if (variacion == 'Mensual') {
      duration = 'week';
    }
    else if (variacion == 'Anual') {
      duration = 'quarter';
    }
    else if (variacion == 'Trimestral') {
      duration = 'month';
    }
    else if (variacion == 'Semestral') {
      duration = 'month';
    }

    var cant: number = 0;

    var d = moment(this.fechaDesde).toDate();
   
    var h: Moment = moment(this.fechaHasta);

    while(h.isSameOrAfter(moment(d).add(cant, duration))) {

      intervalos.push(moment(d).add(cant, duration));
      cant++;
    }

    if(_.isEmpty(_.filter(intervalos, function(i:Moment) {
      return i.isSame(h,'day');
    }))) {
        intervalos.push(h);
    }

    return _.uniq(_.sortBy(intervalos, function(i:Moment) {
        return i.toDate();
    }));
  }

  onVariacionChange(): void {
    this.fechaDesde = this.getFechaDesde(this.variacionElegida, moment(this.fechaHasta)).toDate().toISOString();
    this.updateChartData();
  }

  updateChartData(): void {
    var fechas: Moment[] = this.getIntervalos(this.variacionElegida);

    this.lineChartLabels = _.map(fechas, function (f: Moment) {
      return f.format('DD/MM/YYYY');
    });
    this.getCotizaciones(this.indicadores, fechas);
  };

  getCotizaciones(indicadores: any[], fechas: Moment[]): void {
    var f = _.map(fechas, function (f: Moment) {
      return f.format("MM/DD/YYYY");
    });

    var i = _.map(indicadores, function (i: any) {
      return i.id;
    });

    var lcdata = this.lineChartData;
    
    var loadingItem = this.presentLoading();

    this.indicadoresDataProvider.getMultiIndicadorCotizaciones(i.join(), f.join())
    .finally(() => {
      this.cancelLoading(loadingItem);
    })
    .subscribe((cotizacionesData: any) => {

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

    var fechas = [this.fechaDesde, this.fechaHasta];

    this.lineChartLabels = _.map(fechas, function (f: string) {
      return moment(f).format('DD/MM/YYYY');
    });

    var loadingItem = this.presentLoading();

    dataProvider.getIndicadores()
    .finally(() => {
      
      this.cancelLoading(loadingItem);
    })
    .subscribe((indicadoresData: any) => {
      this.lineChartData = [];
      for (var i = 0; i < indicadoresData.items.length; i++) {
        this.indicadores.push(indicadoresData.items[i]);
        this.lineChartData.push({ data: [], label: indicadoresData.items[i].abreviatura, id: indicadoresData.items[i].id });
      }
    });
  }
}
