import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import moment, { Moment } from 'moment';
import * as _ from 'lodash'

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})

export class ContactPage {

  public variaciones: Array<string> = ['Diaria', 'Mensual', 'Anual'];
  public variacionElegida: string = 'Diaria';

  public fechaDesde: string = moment().add(-1, 'day').startOf('day').toDate().toISOString();
  public fechaHasta: string = moment().startOf('day').toDate().toISOString();

  formatMomentDate(item: moment.Moment): string {
    return item.format('DD/MM/YYYY');
  }

  formatDate(item: string): string {
    return this.formatMomentDate(moment(item));
  }

 
  onVariacionChange(): void {
    if(this.variacionElegida == 'Diaria') {
      this.fechaDesde =  moment().add(-1, 'day').startOf('day').toDate().toISOString();
    }
    else if(this.variacionElegida == 'Mensual') {
      this.fechaDesde =  moment().add(-1, 'month').startOf('day').toDate().toISOString();
    }
    else if(this.variacionElegida == 'Anual') {
      this.fechaDesde =  moment().add(-1, 'year').startOf('day').toDate().toISOString();
    }

    for (var i = 0; i < this.indicadores.length; i++) {
      var ind = this.indicadores[i];

      this.getCotizaciones(ind, this.fechaDesde, this.fechaHasta);
    }
  }

  public indicadores: Array<any> = [];

  constructor(public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

  }

  getCotizaciones(indicador: any, fechaDesde: string, fechaHasta: string): void {

    this.indicadoresDataProvider.getCotizaciones(indicador.id, fechaDesde, fechaHasta).subscribe((cotizacionesData: any) => {

      var valoresCotizacionesOrdenadas = _.sortBy(cotizacionesData.cotizaciones, function (c) {
        return moment(c.fechaHoraCotizacion).toDate();
      });

      indicador.ultimaCotizacion = _.last(valoresCotizacionesOrdenadas);

      indicador.primeraCotizacion = _.first(valoresCotizacionesOrdenadas);

      if (indicador.primeraCotizacion) {
        indicador.variacionPorcentual = 100 * ((indicador.ultimaCotizacion.valorCotizacion / indicador.primeraCotizacion.valorCotizacion)-1);
      }
   
    });
  }

  ionViewDidLoad() {
    var dataProvider = this.indicadoresDataProvider;

    dataProvider.getIndicadores().subscribe((indicadoresData: any) => {

      for (var i = 0; i < indicadoresData.items.length; i++) {
        var ind = indicadoresData.items[i];
        ind.variacionPorcentual = 0;
        this.getCotizaciones(ind, this.fechaDesde, this.fechaHasta);

        this.indicadores.push(ind);
      }
    });
  }

}
