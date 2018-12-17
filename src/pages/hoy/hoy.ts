import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IndicadoresData } from '../../providers/indicadores-data';
import * as _ from 'lodash'
import moment, { Moment } from 'moment';
import { Loading, LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/finally';

@Component({
    selector: 'page-hoy',
    templateUrl: 'hoy.html'
})
export class HoyPage {
    public indicadores: Array<any> = [];

    public fechaCotizacion: Moment = moment().endOf('day');

    public cantidadDias: number = 1;

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

    getCotizaciones(indicador: any, fechaCotizacion: Moment): void {
        var f1 = fechaCotizacion;
        var f2 = moment(fechaCotizacion).add(-1 * this.cantidadDias, 'day');

        var fechas = _.map([f1, f2], function (fecha: Moment) {
            return fecha.format("MM/DD/YYYY");
        });

        this.indicadoresDataProvider
        .getMultiIndicadorCotizaciones(indicador.id, fechas.join())
        .subscribe((cotizacionesData: any) => {
            var cotizaciones = _.map(cotizacionesData.cotizaciones, function (c) {
                return {
                    fechaHoraCotizacion: c.fechaHoraCotizacion,
                    valorCotizacion: c.valorCotizacion
                };
            });

            var ordenadas = _.sortBy(cotizaciones, function (c) {
                return moment(c.fechaHoraCotizacion).add(c.indicadorId, 'day').toDate();
            });

            _.each(ordenadas, function (c) {
                if (moment().diff(c.fechaHoraCotizacion, 'days') == 0) {
                    indicador.valorCotizacion = c.valorCotizacion;
                    if (indicador.cotizacionPrevia) {

                        indicador.variacion = c.valorCotizacion - indicador.cotizacionPrevia;

                        indicador.variacionSigno = indicador.variacion > 0 ? '+' : (indicador.variacion == 0 ? '=' : '-');

                        indicador.variacionPorcentual = (indicador.variacion / indicador.cotizacionPrevia);
                    }
                }
                else {
                    indicador.cotizacionPrevia = c.valorCotizacion;
                }
            });
        });

    };

    ionViewDidLoad() {

        var dataProvider = this.indicadoresDataProvider;
        this.mode = dataProvider.mode;

        var loadingItem = this.presentLoading();

        dataProvider.getIndicadores()
            .finally(() => {
                loadingItem.dismiss();
            })
            .subscribe((indicadoresData: any) => {
                for (var i = 0; i < indicadoresData.items.length; i++) {
                    var ind = indicadoresData.items[i];
                    this.indicadores.push(ind);
                    this.getCotizaciones(ind, this.fechaCotizacion);

                }
            });
    };
}
