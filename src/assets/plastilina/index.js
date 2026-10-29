// Miniaturas de plastilina (generadas con IA en el estilo de las de Yolani). Todas comparten el mismo
// fondo celeste, así que el recuadro que las contiene usa ese color y la imagen se funde con él.
import bandera320 from './bandera-320.webp'
import bandera640 from './bandera-640.webp'
import caja320 from './caja-320.webp'
import caja640 from './caja-640.webp'
import calendario320 from './calendario-320.webp'
import calendario640 from './calendario-640.webp'
import casa320 from './casa-320.webp'
import casa640 from './casa-640.webp'
import cochinito320 from './cochinito-320.webp'
import cochinito640 from './cochinito-640.webp'
import mecedora320 from './mecedora-320.webp'
import mecedora640 from './mecedora-640.webp'
import noche320 from './noche-320.webp'
import noche640 from './noche-640.webp'
import planta320 from './planta-320.webp'
import planta640 from './planta-640.webp'
import recibo320 from './recibo-320.webp'
import recibo640 from './recibo-640.webp'
import regla320 from './regla-320.webp'
import regla640 from './regla-640.webp'
import reloj320 from './reloj-320.webp'
import reloj640 from './reloj-640.webp'
import salvavidas320 from './salvavidas-320.webp'
import salvavidas640 from './salvavidas-640.webp'
import sobre320 from './sobre-320.webp'
import sobre640 from './sobre-640.webp'

export const FONDO_PLASTILINA = '#d6e8fc'
export const FONDO_NOCHE = '#060d23'

const par = (s, l, alt) => ({ s, l, alt })

export const PLASTILINA = {
  bandera: par(bandera320, bandera640, 'Banderita verde de plastilina clavada en un montículo, como una meta alcanzada.'),
  caja: par(caja320, caja640, 'Caja fuerte de plastilina color crema con una perilla naranja.'),
  calendario: par(calendario320, calendario640, 'Calendario de escritorio de plastilina con un día encerrado en un círculo azul.'),
  casa: par(casa320, casa640, 'Casita de plastilina con puerta azul y un corazón sobre la puerta.'),
  cochinito: par(cochinito320, cochinito640, 'Cochinito de plastilina con una moneda naranja entrando por la ranura.'),
  mecedora: par(mecedora320, mecedora640, 'Mecedora de plastilina con un cojín azul y una cobija naranja en el brazo.'),
  noche: par(noche320, noche640, 'Mecedora de plastilina bajo una luna, de noche.'),
  planta: par(planta320, planta640, 'Maceta de plastilina con una plantita de hojas verdes.'),
  recibo: par(recibo320, recibo640, 'Recibo de pago de plastilina con una pluma azul encima.'),
  regla: par(regla320, regla640, 'Regla de plastilina con una moneda azul parada sobre ella.'),
  reloj: par(reloj320, reloj640, 'Reloj de arena de plastilina con arena azul.'),
  salvavidas: par(salvavidas320, salvavidas640, 'Salvavidas de plastilina color crema con franjas naranjas.'),
  sobre: par(sobre320, sobre640, 'Sobre de nómina de plastilina con billetes y un sello azul.'),
}
