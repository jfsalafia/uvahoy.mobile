import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
import { Loading, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'page-hoy',
    templateUrl: 'hoy.html'
})
export class HoyPage {
    public indicadores: Array<any> = [];

    public fechaCotizacion: Moment = moment().endOf('day');

    public cantidadDias : number = 1;

    public mode: string = "";

    constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public indicadoresDataProvider: IndicadoresData) {

    };

    presentLoading(): Loading {
        const loader = this.loadingCtrl.create({
            content: "Consultando indicadores..."
        });
        loader.setDuration(5000);
        loader.present();

        return loader;
    };

    cancelLoading(item: Loading) {
        item.dismiss();
    };

    formatMomentDate(item: moment.Moment): string {
        return item.format('DD/MM/YYYY');
    };

    formatDate(item: string): string {
        return this.formatMomentDate(moment(item));
    };

    getCotizaciones(indicadores: any[], fechaCotizacion: Moment): void {
        var i = _.map(indicadores, function (i: any) {
            return i.id;
        });

        var f1 = fechaCotizacion;
        var f2 = moment(fechaCotizacion).add(-1*this.cantidadDias,'day');

        var fechas = _.map([f1,f2], function (fecha: Moment) {
            return fecha.format("MM/DD/YYYY");
        });

        var x = this.indicadoresDataProvider.getMultiIndicadorCotizaciones(i.join(), fechas.join()).subscribe((cotizacionesData: any) => {
            var cotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
                return {
                    indicadorId: c.indicadorId,
                    fechaHoraCotizacion: c.fechaHoraCotizacion,
                    valorCotizacion: c.valorCotizacion
                };
            });

            var ordenadas = _.sortBy(cotizaciones, function (c) {
                return moment(c.fechaHoraCotizacion).add(c.indicadorId,'day').toDate();
            });

            _.each(ordenadas, function (c) {
                var ind = _.filter(indicadores, function (i) {
                    return i.id == c.indicadorId;
                });

                if (!_.isEmpty(ind)) {
                    var indicadorEntity = ind[0];

                    if (moment().diff(c.fechaHoraCotizacion, 'days') == 0) {
                        indicadorEntity.valorCotizacion = c.valorCotizacion;
                        if (indicadorEntity.cotizacionPrevia) {

                            indicadorEntity.variacion = c.valorCotizacion - indicadorEntity.cotizacionPrevia;
                            
                            indicadorEntity.variacionSigno = indicadorEntity.variacion > 0 ? '+':  (indicadorEntity.variacion == 0 ? '=': '-');

                            indicadorEntity.variacionPorcentual =  (indicadorEntity.variacion / indicadorEntity.cotizacionPrevia);
                        }
                    }
                    else {
                        indicadorEntity.cotizacionPrevia = c.valorCotizacion;
                    }
                }
            });
        });
        
    };

    ionViewDidLoad() {

        var dataProvider = this.indicadoresDataProvider;
        this.mode = dataProvider.mode;

        var loadingItem = this.presentLoading();

        dataProvider.getIndicadores().subscribe((indicadoresData: any) => {

            for (var i = 0; i < indicadoresData.items.length; i++) {
                this.indicadores.push(indicadoresData.items[i]);
            }

            this.getCotizaciones(this.indicadores, this.fechaCotizacion);
          
        });
    };
}
