# RESUMEN ARQUITECTURA

<!--toc:start-->

- [RESUMEN ARQUITECTURA](#resumen-arquitectura)
  - [SOFTWARE](#software)
    - [DE BASE](#de-base)
      - [OS (Operating System)](#os-operating-system)
      - [Lenguajes de programación](#lenguajes-de-programación)
  - [MODOS DE DIRECCIONAMIENTO:](#modos-de-direccionamiento)
  - [CISC VS RISC](#cisc-vs-risc)
  - [I/O (Input/Output)](#io-inputoutput)
    - [Bus](#bus)
    - [Módulo I/O Módulo E/S](#módulo-io-módulo-es)
      - [async vs sync](#async-vs-sync)
      - [Maneras de operar con I/O](#maneras-de-operar-con-io)
      - [TIMER](#timer)
      - [Interrupciones](#interrupciones)
      - [Tabla de estado de dispositivos](#tabla-de-estado-de-dispositivos)
  - [PIPELINE](#pipeline)
  - [FPU (Floating-Point Unit)](#fpu-floating-point-unit)
  - [TIPOS DE COMPUTADORA](#tipos-de-computadora)
  - [PLL (Phase-Locked Loop)](#pll-phase-locked-loop)
  - [CACHE](#cache)
  - [MMX](#mmx)
  - [CHIPSET](#chipset)
  - [SMP (Symmetric Multiprocessing)](#smp-symmetric-multiprocessing)
  - [Multi Threading / Hyper Threading](#multi-threading-hyper-threading)
  - [MEMORIA AUXILIAR](#memoria-auxiliar)
    - [HDD](#hdd)
      - [ELEMENTOS DEL HDD](#elementos-del-hdd)
      - [Access time](#access-time)
      - [INTERCALADO](#intercalado)
      - [COMO ACCEDER AL HDD](#como-acceder-al-hdd)
      - [DVD](#dvd)

<!--toc:end-->

## SOFTWARE

> [!IMPORTANT]
> Es el conjunto de programas y documentación que permiten el adecuado funcionamiento, operación y programación de las computadoras.

Se clasifica de la siguiente manera:

- De base
- del usuario
- de ambiente o de productividad

### DE BASE

> [!IMPORTANT]
> incluye el OS y los lenguajes de programación

#### OS (Operating System)

> [!NOTE]
> Es un conjunto de programas que gestiona datos y administra tareas. Son el **programa de control maestro**. El objetivo principal del OS es la **ABSTRACCIÓN**, con eso permitimos al developer y al user no tener que pensar muy low-level.

Clasificación:

- Modo gráfico: Este se encarga de controlar cada pixel, su color, intensidad y brillo.
- Modo texto: trabajan digitando instrucciones.

Soporte físico de los os:

> [!TIP]
> Recordemos que las instrucciones tienen que estar en la **RAM** para poder ejecutarse.

El OS reside principalmente en el **disco duro**(HDD/SDD), pero para arrancar una parte reside en la **ROM** denominada **BIOS**.
Prender PC -> BIOS -> BOOTLOADER -> PC funcionando.

Drivers:
Cada elemento del **HARDWARE** debe de ser reconocido por el OS, para poder utilizarlo. Para reconocerlo se utilizan los drivers. Un buen ejemplo es el de los Drivers de WIFI o de USB.

Principalmente, se usan OS tanto Windows o Unix

#### Lenguajes de programación

> [!NOTE]
> Se denomina **programa fuente** a todo programa que no este escrito en lenguaje máquina. Se denomina **programa objeto** al ejecutable final.

Clasificación:

- De máquina: Es el medio de comulación entre el developer y la PC.

- De bajo nivel: Son orientados a la máquina
  - Numéricos: se escriben en hexadecimal o binario. Se utiliza el **COMPILADOR** para traducir este a lenguaje máquina.
  - Assembly: es el lenguaje de mnemónicos.
  - Assembly con direccionamiento simbólico: el programador escribe las direcciones relativas. La traducción de estas las hace el **LINK-EDITOR**.
  - Macro Assambler V1: Introduce el uso de palabras reservadas. El conjunto de estas palabras + los mnemónicos se denominan **LIBRERÍA**. Entonces este programa pasa por él -> Ensamblador (traduce las palabras reservadas) -> link-editor (traduce las direcciones de memoria) -> compila el programa.
  - Macro Assambler V2: elimina el proceso de **ENSAMBLAJE**, incluyendo todo en el compilador, reduciendo el tiempo de compilado.

- De alto nivel: Surgen post-Assambler V2. Surgen de la idea de Librerías y palabras reservadas.
  - FORTRAN: Es el primer lenguaje de alto nivel. Incluyo operaciones matemáticas, como el $SIN(x)$ y operadores lógicos. El programa fuente se compila y de link-edita.
  - COBOL: Introdujo tareas como el input/output. Y tenía una sintaxis más legible que Fortran.
  - BASIC: Introdujo conceptos como la **EDICIÓN** (que luego migro a los **IDE**), y un **INTÉRPRETE**. (también tenía modo compilado)

Etapas de compilación:

- [ ] Análisis lexicográfico: Identifica los elementos y los traduce a tokens. Detecta secuencias de caracteres que no formen tokens válidos.
- [ ] Análisis sintáctico: Comprueba que los tokens estén organizados correctamente. Detecta operadores mal ubicados, falta de toques.
- [ ] Análisis semántico: Comprueba que los toques tengan sentido. Detecta incompatibilidad de tipos, etc.

Ciclo de vida del software:

```mermaid
flowchart LR
    Fetch --> Decode --> Execute --> WB[Write-back]
```

## MODOS DE DIRECCIONAMIENTO:

!> [!NOTE]

> La CPU se compone por la ALU y la CU y algunos registros. La ALU se encarga de realizar operaciones aritméticas y lógicas, mientras que la CU se encarga de controlar el flujo de datos y las instrucciones.

- Inherente: Tiene un formato de una palabra lógica(8 bits). Se encuentra el código de operación y el registro. Utiliza el Acumulador.
- Inmediato: Se encuentra el código de operación y el operando, utiliza 2 palabras lógicas(16 bits). El operando es un valor constante que se encuentra en la instrucción.
- Relativo: Utiliza dos palabras lógicas(16 bits). 6 bits opcode, 2 bits el registro. Los 8 restantes se componen por I(1 bit) y 7 bits más que indican el desplazamiento que va a subir el PC o el XR(registro de índice). IF I=0 entonces el desplazamiento se aplica al PC, si I=1 entonces el desplazamiento se aplica al XR. El desplazamiento es un valor que se suma o resta al PC o al XR para obtener la dirección efectiva de la instrucción. Valor fluctúa entre -64 y 63.

## CISC VS RISC

- **CISC**(Complex Instruction Set Computer): Tienen muchas más operaciones. Tienen instrucciones complejas que pueden realizar varias operaciones en una sola instrucción. Esto permite que los programas sean más cortos y fáciles de escribir, pero también hace que el hardware sea más complejo y lento. Y gastan más energía.
- **RISC**(Reduced Instruction Set Computer): Tienen menos operaciones. Tienen instrucciones simples que realizan una sola operación en una sola instrucción. Esto permite que el hardware sea más simple y rápido, pero también hace que los programas sean más largos y difíciles de escribir. Y gastan menos energía. EJEMPLO: ARM.

## I/O (Input/Output)

### Bus

- Direcciones: Es utilizado por el procesador para indicar la dirección de memoria.
- Control: Indicado por el procesador para indicar la operación que se va a realizar. (lectura o escritura)
- datos: Es utilizado por el procesador para enviar o recibir datos de la memoria o de los dispositivos de entrada/salida.

### Módulo I/O Módulo E/S

> [!IMPORTANT]
> En este tipo de módulos los drivers son fundamentales. Se encargan de traducir las instrucciones del procesador a instrucciones que los dispositivos de entrada/salida puedan entender. Por lo general, hoy en día el OS asigna direcciones de memoria a los dispositivos I/O. Cada tipo de I/O tiene su propio driver.

Para operar con I/O se utilizan 3 maneras:

#### async vs sync

sync: La CPU se queda haciendo polling al debe hasta que esté listo.
async: La CPU se pone a hacer otras cosas y el device interrumpe a la CPU cuando esté listo.

#### Maneras de operar con I/O

- Programada(sync): El procesador se encarga de enviar y recibir datos de los dispositivos de entrada/salida. El procesador debe esperar (comprobar constantemente a que el device termine) a que el dispositivo esté listo para enviar o recibir datos. Esto puede causar que el procesador se quede esperando y no pueda realizar otras tareas.
- Interrupciones(async): El procesador se encarga de enviar y recibir datos de los dispositivos. El device interrumpe a la CPU cuando termine.
- DMA (Direct Memory Access)(async): La CPU le indica al DMA que lea o escriba datos con un offset de memoria. El DMA se encarga de enviar y recibir datos de los dispositivos de entrada/salida sin la intervención del procesador. Esto permite que el procesador pueda realizar otras tareas mientras el DMA se encarga de la transferencia de datos. Sería muy tardío imprimir todos los píxeles de una imagen si la CPU tuviera que hacerlo, por eso se utiliza el DMA para que se encargue de la transferencia de datos entre la memoria y el dispositivo de salida.

#### TIMER

El timer (temporizador) es un dispositivo de hardware que genera interrupciones después de un intervalo de tiempo determinado. Es importante porque permite que el sistema operativo recupere el control del CPU periódicamente.

#### Interrupciones

Para iniciar una operación de I/O, el procesador actualiza los registros del módulo I/O. El módulo luego se encarga de realizar en enviar el resultado de la operación según el registro actualizado. Este luego interrumpe a la CPU.

1. Módulo I/O envía una Interrupción.
2. El procesador termina la instrucción que estaba ejecutando.
3. La CPU verifica si hay alguna interrupción pendiente.
4. El procesador guarda el estado de la instrucción que estaba ejecutando.
5. El procesador carga en el PC la RUNTINE(generada por el OS) de la interrupción.
6. El procesador ejecuta la rutina de la interrupción.
7. El procesador restaura el estado de la instrucción que estaba ejecutando.

#### Tabla de estado de dispositivos

Es una tabla que mantiene el sistema operativo con información sobre los dispositivos de entrada/salida y las operaciones que están realizando.
Cada entrada contiene:

- Tipo de dispositivo: teclado, impresora, disco, etc.
- Dirección: permite identificar el dispositivo.
- Estado: puede estar ocioso, ocupado o no funcionando.
- Solicitud y parámetros: si está ocupado, se guarda información sobre la operación solicitada.

**TYPEAHEAD**: Significa que el usuario puede ingresar datos antes de que el programa los solicite.
Por ejemplo:

1. Abrís un programa que te va a pedir que escribas tu nombre.
2. Antes de que aparezca el pedido, empiezas a escribir en el teclado.
3. Se generan interrupciones por los caracteres ingresados, aunque todavía no haya un proceso que los esté solicitando.
4. El sistema necesita guardar esos caracteres en un buffer (un espacio temporal de memoria).
5. Cuando el programa finalmente pide la entrada, puede recuperar los caracteres almacenados.

## PIPELINE

> [!TIP]
> Recordemos el proceso para ejecutar una instrucción: COPIAR instrucción -> INCREMENTAR PC -> DECODIFICAR instrucción -> EJECUTAR.

![Muestra como es el PIPELINE](1.png)

Permite que se ejecuten estos pasos por separado, de manera que mientras una instrucción se está ejecutando, otra puede estar siendo decodificada y otra puede estar siendo copiada. Esto permite que se ejecute más de una instrucción al mismo tiempo, aumentando el rendimiento del procesador.

Los principales problemas son:

- Dependencia de datos: una instrucción necesita el resultado de otra.
- Conflicto estructural: dos instrucciones necesitan el mismo recurso de hardware al mismo tiempo.
- Conflicto de control: una instrucción de salto modifica qué instrucción debe ejecutarse a continuación.

## FPU (Floating-Point Unit)

Es la unidad de punto flotante del procesador. Es el componente encargado de realizar operaciones aritméticas con números que tienen parte fraccionaria, como decimales. Ahora se incorpora directamente en el procesador, pero antes era un coprocesador que se encargaba de realizar estas operaciones.

| ALU                                                 | FPU                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| Realiza operaciones enteras y lógicas, entre otras. | Realiza operaciones con números en punto flotante. (Números con coma) |
| $5 + 3 = 8$                                         | $5{,}25 + 3{,}5 = 8{,}75$                                             |

## TIPOS DE COMPUTADORA

- Supercomputadoras (supercomputer): Son computadoras de alto rendimiento diseñadas para realizar cálculos complejos a gran velocidad. Se utilizan en investigación científica, simulaciones y modelado de fenómenos naturales.
- Computadora (mainframe): Son computadoras de gran tamaño y capacidad, utilizadas principalmente por grandes organizaciones para procesar grandes cantidades de datos y ejecutar aplicaciones críticas.
- Minicomputadora (minicomputer): Son computadoras de tamaño mediano, más pequeñas que el mainframe pero más grandes que las microcomputadoras. Se utilizan en entornos empresariales y científicos para tareas específicas.
- Microcomputadora (microcomputer): Son computadoras de tamaño pequeño, diseñadas para uso personal o en pequeñas empresas. Incluyen computadoras de escritorio, portátiles y dispositivos móviles. Surgen con los microprocesadores.
  - Estación de trabajo: es una microcomputadora de gran potencia que se
    utiliza para trabajos de ingeniería o similares y permite la conexión a través de una red con una
    computadora de mayor potencia.
  - Computadora personal: es una microcomputadora fácil de usar y con grandes prestaciones.
    - Pocket-PC: es una microcomputadora de tamaño reducido que se puede llevar en el bolsillo y que permite realizar tareas básicas como enviar correos electrónicos, navegar por internet y utilizar aplicaciones.

## PLL (Phase-Locked Loop)

> [!TIP]
> Genera una frecuencia interna mayor a la frecuencia del reloj externo. Esto permite que el procesador funcione a una velocidad mayor que la del reloj externo, aumentando el rendimiento del sistema.

## CACHE

> [!TIP]
> Recordemos que mientras más cerca este el dato del procesador más rápido será su acceso.

La caché es una memoria de **alta velocidad** (SRAM) que se encuentra entre la memoria principal y el procesador. Su función es almacenar **temporalmente** los datos e instrucciones que se utilizan con mayor frecuencia, para que el procesador pueda acceder a ellos más rápidamente. Es **muy cara**.

La caché se clasifica en $N$ niveles(puede tener más):

- L1: Es la caché más cercana al procesador y tiene la menor capacidad. Se encuentra dentro del procesador y se puede divide en dos partes: una para instrucciones y otra para datos. Su tamaño suele ser de 16 kB a 128KB.
- L2: Es la caché intermedia y tiene una capacidad mayor que la L1.
- L3: Es la caché más lejana al procesador y tiene la mayor capacidad. Se encuentra fuera del procesador y suele ser compartida por varios núcleos de un procesador. Su tamaño suele ser de 2 MB a 32 MB.

Por lo general, Cada CPU tiene su propia caché L1, pero comparte la caché L2. La L3 es compartida por todos los núcleos del procesador. Esto permite que los núcleos puedan acceder a los datos e instrucciones almacenados en la caché de manera más rápida y eficiente.

## MMX

El **MMX** que es el acrónimo de Multimedia extensión, está pensado para mejorar el manejo de gráficos en pantalla, para ello debe trabajar con números de coma flotante.

## CHIPSET

La CPU no se conecta directamente de cualquier manera con todos los componentes. El chipset organiza y gestiona esas comunicaciones.
Un chipset es un conjunto de circuitos integrados que se encuentran en la placa base de una computadora y que se encargan de controlar la comunicación entre la CPU, la memoria, los dispositivos de entrada/salida y otros componentes del sistema. El chipset actúa como un intermediario entre la CPU y los demás componentes, asegurando que los datos se transfieran de manera eficiente y coordinada.

- Northbridge: Es el componente del chipset que se encarga de controlar la comunicación entre la CPU, la memoria RAM y la tarjeta gráfica. Se encuentra cerca de la CPU y tiene una conexión directa con ella.
- Southbridge: Es el componente del chipset que se encarga de controlar la comunicación entre la CPU y los dispositivos de entrada/salida, como discos duros, puertos USB, tarjetas de sonido y red. Se encuentra más alejado de la CPU y se comunica con ella a través del Northbridge.

## SMP (Symmetric Multiprocessing)

Son sistemas que utilizan múltiples procesadores para ejecutar tareas de manera simultánea. En un sistema SMP, todos los procesadores tienen acceso a la misma memoria y pueden ejecutar cualquier tarea asignada por el sistema operativo. Esto permite mejorar el rendimiento y la capacidad de procesamiento del sistema, ya que las tareas se pueden distribuir entre los procesadores disponibles.

Si bien el performance es mucho mejor, el costo, no solo económico, sino el costo en complejidad. Estos sistemas comparten la memoria por lo que pueden surgir problemas de sincronización. Incluso si cada procesador tiene su propia caché. La temperatura también es mayor.

## Multi Threading / Hyper Threading

Trabaja con hilos, que son como CPU virtuales. Cada hilo tiene su PC y sus registros, comparten la ALU y la CU. Cuando un hilo está esperando por I/O, otro hilo puede ejecutar instrucciones. Esto permite que un solo procesador pueda ejecutar múltiples tareas de manera concurrente, mejorando la eficiencia y el rendimiento del sistema.

## MEMORIA AUXILIAR

Es la memoria no volátil, que tiende a ser a mayor escala y más lenta.

| Componente / operación          | Tiempo de lectura | Tiempo de escritura |
| ------------------------------- | ----------------: | ------------------: |
| Registro de CPU                 |          0,2–1 ns |            0,2–1 ns |
| Caché L1                        |        0,5–1,5 ns |               ~1 ns |
| Caché L2                        |            2–5 ns |             3–10 ns |
| Caché L3                        |           5–20 ns |            10–30 ns |
| RAM                             |         50–100 ns |           50–100 ns |
| SSD NVMe                        |         10–100 µs |           10–100 µs |
| SSD SATA                        |         50–200 µs |           50–200 µs |
| HDD mecánico (acceso aleatorio) |           5–15 ms |             5–15 ms |
| Red local (LAN)                 |    0,1–1 ms (RTT) |      0,1–1 ms (RTT) |
| TCP (LAN, conexión establecida) |    0,1–1 ms (RTT) |      0,1–1 ms (RTT) |
| UDP (LAN)                       |    0,1–1 ms (RTT) |      0,1–1 ms (RTT) |
| Internet (servidor cercano)     |     5–30 ms (RTT) |       5–30 ms (RTT) |
| Internet (servidor lejano)      |  50–200+ ms (RTT) |    50–200+ ms (RTT) |

### HDD

Son los discos duros mecánicos. Son los más lentos y baratos.
![Disco Duro](2.png)

#### ELEMENTOS DEL HDD

- Platos: Son discos circulares de metal o vidrio recubiertos de material magnético. Cada plato tiene dos caras, y cada cara puede almacenar datos.
- Cabezas de lectura/escritura: Son dispositivos electromagnéticos que se encargan de leer y escribir datos en los platos. Cada plato tiene una cabeza de lectura/escritura para cada cara. Las cabezas se encuentran montadas en un brazo que se mueve sobre los platos para acceder a diferentes pistas.
- Pista: son círculos de radio variable dependiendo de su zona, que almacenan datos.
- Sector: es la unidad mínima de almacenamiento en un disco duro. Cada pista se divide en sectores, que suelen tener un tamaño de 512 bytes o 4096 bytes.
- Cilindro: es un conjunto de pistas que se encuentran en el mismo radio en todos los platos. Cada cilindro tiene el mismo número de pistas y sectores, lo que permite acceder a los datos de manera más eficiente.
- Motor: gira a todos los platos al mismo tiempo.

#### Access time

Es el tiempo que tarda el disco en localizar y leer un sector.

- Seek time: es el tiempo que tarda la cabeza de lectura/escritura en moverse a la pista correcta.
- Tiempo de estabilización: es el tiempo que tarda la cabeza de lectura/escritura en estabilizarse sobre la pista correcta.
- Latencia rotacional: es el tiempo que tarda el plato en girar hasta que el sector deseado se encuentra bajo la cabeza de lectura/escritura.
- Tiempo al buffer: es el tiempo que tarda el disco en transferir los datos desde el sector leído al buffer del disco.
- Tiempo al host: es el tiempo que tarda el disco en transferir los datos desde el buffer del disco al host (computadora).

#### INTERCALADO

Supóngase una secuencia de sectores del 0 a los 7 $S = \[0,1,2,3,4,5,6,7]$. Si el disco almacena el contenido de S secuencialmente, se va a obtener $S_0$ y cuando se busque $S_1$, el disco ya habrá girado y se habrá pasado de $S_1$ teniendo que esperar a que de la vuelta completa (Esto depende de la velocidad del disco). Entonces lo que se hace es separar $S_n$ y $S_{n+1}$ de modo tal que $\Delta S$ sea mayor que en la cantidad de sectores que se pasa el disco.

#### COMO ACCEDER AL HDD

- CHS: El OS indica esto. Ejemplo: (C, H, S) = (10, 2, 7)
  - C — Cylinder (cilindro): conjunto de pistas que están a la misma distancia del centro en todas las superficies de los platos.
  - H — Head (cabeza): identifica qué cabeza lectora/escritora y, por lo tanto, qué superficie se utiliza.
  - S — Sector: identifica el sector dentro de la pista seleccionada.

- LBA: El driver del HDD traduce la dirección. Ejemplo, el disco tiene 4 platos, y dos caras, por cada cara 64 sectores. Entonces si el OS solicita el sector 120 el driver lo traduce a la cara número 2. $120 // 64$ para identificar la cara.

#### DVD

El DVD a diferencia del HDD tiene un solo track espiralado. Entonces para acceder a un sector, se tiene que recorrer todo el track hasta encontrar ese sector. Es por eso que es bastante más lento.
