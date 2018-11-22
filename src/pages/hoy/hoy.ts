import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
import { Loading, LoadingController } from 'ionic-angular';

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

        this.indicadoresDataProvider.getMultiIndicadorCotizaciones(i.join(), fechas.join()).subscribe((cotizacionesData: any) => {
            var cotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
                return {
                    indicadorId: c.indicadorId,
                    fechaHoraCotizacion: c.fechaHoraCotizacion,
                    valorCotizacion: c.valorCotizacion
                };
            });

            var ordenadas = _.sortBy(cotizaciones, function (c) {
                return moment(c.fechaHoraCotizacion).toDate();
            });

            _.each(ordenadas, function (c) {
                var ind = _.filter(indicadores, function (i) {
                    return i.id == c.indicadorId
                });

                if (!_.isEmpty(ind)) {
                    var indicador = _.first(ind);

                    if (moment().diff(c.fechaHoraCotizacion, 'days') == 0) {
                        indicador.valorCotizacion = c.valorCotizacion;
                        if (indicador.cotizacionPrevia) {
                            indicador.variacion = c.valorCotizacion - indicador.cotizacionPrevia;
                            indicador.variacionSigno = indicador.variacion > 0 ? '+':  (indicador.variacion == 0 ? '=': '---');

                            indicador.variacionPorcentual =  (indicador.variacion / indicador.cotizacionPrevia);
                        }
                    }
                    else {
                        indicador.cotizacionPrevia = c.valorCotizacion;
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

            this.cancelLoading(loadingItem);
        });
    };
}
