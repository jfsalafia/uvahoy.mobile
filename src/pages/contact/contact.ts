import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import moment from 'moment';
import { Loading, LoadingController } from 'ionic-angular';
import * as _ from 'lodash'

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})

export class ContactPage {
  public cantidadDetalle: number = 5;
  public mode: string = "";
  public variaciones: Array<string> = ['Diaria', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
  public variacionElegida: string = 'Diaria';


  public fechaHasta: string = this.formatMomentDate(moment().startOf('day'));
  public fechaDesde: string = this.getFechaDesde(this.variacionElegida, moment(this.fechaHasta));


  presentLoading(): Loading {
    const loader = this.loadingCtrl.create({
        content: "Consultando cotizaciones..."
    });
    loader.setDuration(5000);
    loader.present();

    return loader;
};

  formatMomentDate(item: moment.Moment): string {
    return item.format('MM/DD/YYYY');
  }

  formatDate(item: string): string {
    return moment(item).format('DD/MM/YY');
  }

  getFechaDesde(variacion: string, fechaHasta: moment.Moment): string {
    let fechaDesde: moment.Moment = fechaHasta;

    if (variacion == 'Diaria') {
      fechaDesde = fechaHasta.add(-1, 'day').startOf('day');
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
    return this.formatMomentDate(fechaDesde);
  }

  onVariacionChange(): void {
    let fh: moment.Moment = moment().startOf('day');

    this.fechaHasta = this.formatMomentDate(fh);
    this.fechaDesde = this.getFechaDesde(this.variacionElegida, fh);

    for (var i = 0; i < this.indicadores.length; i++) {
      var ind = this.indicadores[i];

      this.getCotizaciones(ind, this.fechaDesde, this.fechaHasta);
    }
  }

  public indicadores: Array<any> = [];

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

  }

  getCotizaciones(indicador: any, fechaDesde: string, fechaHasta: string): void {

    var loadingItem = this.presentLoading();

    this.indicadoresDataProvider.getCotizaciones(indicador.id, fechaDesde, fechaHasta)
    
    .finally(() => {
      loadingItem.dismiss();
    })
    .subscribe((cotizacionesData: any) => {

      var valoresCotizacionesOrdenadas = _.sortBy(cotizacionesData.cotizaciones, function (c) {
        return moment(c.fechaHoraCotizacion).toDate();
      });



      indicador.ultimaCotizacion = _.last(valoresCotizacionesOrdenadas);

      indicador.primeraCotizacion = _.first(valoresCotizacionesOrdenadas);

      if (indicador.primeraCotizacion) {
        indicador.variacionPorcentual = ((indicador.ultimaCotizacion.valorCotizacion / indicador.primeraCotizacion.valorCotizacion) - 1);
      }

      indicador.cotizaciones = _.take(valoresCotizacionesOrdenadas.reverse(), this.cantidadDetalle);

    });
  }

  ionViewDidLoad() {
    var dataProvider = this.indicadoresDataProvider;
    this.mode = dataProvider.mode;

    dataProvider.getIndicadores()
      .subscribe((indicadoresData: any) => {

        for (var i = 0; i < indicadoresData.items.length; i++) {
          var ind = indicadoresData.items[i];
          ind.variacionPorcentual = 0;
          this.getCotizaciones(ind, this.fechaDesde, this.fechaHasta);

          this.indicadores.push(ind);
        }
      });
  }

}
