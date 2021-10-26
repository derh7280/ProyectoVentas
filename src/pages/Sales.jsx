import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import { Dialog } from '@material-ui/core';
import { getProductByID, getSales, createSale, updateSale, deleteSale } from 'utils/api/sales';
import { getProducts } from 'utils/api/products';
import { getActiveSellers } from 'utils/api/users';
import ReactLoading from 'react-loading';
import 'react-toastify/dist/ReactToastify.css';
import 'styles/modulo.css';

//VISTA
export const Sales = () => {
  const [vendedores, setVendedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosTabla, setProductosTabla] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [ventas, setVentas] = useState([])
  const [textButton, setTextButton] = useState("Crear Venta");
  const [iconButton, setIconButton] = useState("fa fa-user-plus")
  const [tituloModulo, setTituloModulo] = useState("MODULO DE VENTAS")
  const [iconModulo, setIconModulo] = useState("fa fa-table")
  const [ejecutarConsultaVentas, setEjecutarConsultaVentas] = useState(true);
  const [loading, setLoading] = useState(false);

  //LISTADO VENTAS
  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      await getSales(
        (response) => {
          setVentas(response.data);
          setEjecutarConsultaVentas(false);
          setLoading(false);
        },
        (error) => {
          console.error("Error: ", error);
          setLoading(false);
        }
      );
    };
    const fetchVendores = async () => {
      await getActiveSellers(
        (response) => {
          setVendedores(response.data);
        },
        (error) => {
          console.error(error);
        }
      );
    };
    const fetchProductos = async () => {
      await getProducts(
        (response) => {
          setProductos(response.data);
        },
        (error) => {
          console.error(error);
        }
      );
    };

    if (ejecutarConsultaVentas) {
      fetchVentas();
    }
    else
    {
      fetchVendores();
      fetchProductos();
    }
  }, [ejecutarConsultaVentas]);

  //INFO MODULO
  useEffect(() => {
    if (mostrarTabla) {
      setEjecutarConsultaVentas(true);
      setTextButton("Crear Venta");
      setIconButton("fa fa-user-plus px-1")
      setTituloModulo("MODULO DE VENTAS")
      setIconModulo("fa fa-table")
    } else {
      setEjecutarConsultaVentas(false);
      setTextButton("Listar Ventas");
      setIconButton("fa fa-list px-2")
      setTituloModulo("NUEVA VENTA")
      setIconModulo("fab fa-wpforms")
    }
  }, [mostrarTabla])

   return (
    <div className="containerModulo">
      <div className="card shadow">
        <div className="card-header">
          <h3 className="m-0 font-weight-bold">
            <i className={iconModulo}></i> <span className="title py-3">{tituloModulo}</span>
          </h3>
          <div>
            <button type="button" className="btn btn-primary btn-block"
              onClick={() => {
                setMostrarTabla(!mostrarTabla);
              }} >
              <i className={iconButton}></i>{textButton}
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            {
              mostrarTabla ? (
                <TablaVentas loading={loading} listaVentas={ventas} setEjecutarConsultaVentas={setEjecutarConsultaVentas}
                />
              ) : (<FormularioCreacionVentas
                setMostrarTabla={setMostrarTabla}
                listaVentas={ventas}
                setVentas={setVentas}
                vendedores={vendedores}
                productos={productos}
              />)

            }
            <ToastContainer position='bottom-center' autoClose={5000} />
          </div>
        </div>
      </div>
    </div>
  )
}

//TABLA VENTAS
const TablaVentas = ({ loading, listaVentas, setEjecutarConsultaVentas }) => {
  const [busqueda, setBusqueda] = useState('');
  const [ventasFiltradas, setVentasFiltradas] = useState(listaVentas);

  useEffect(() => {
    setVentasFiltradas(
      listaVentas.filter((elemento) => {
        return JSON.stringify(elemento).toLowerCase().includes(busqueda.toLowerCase());
      })
    );
  }, [busqueda, listaVentas]);

  return (
    <div className='container'>
      {/* Zona de Titulos y busqueda */}
      <div className="row">
        <div className="col-3"></div>
        <div className="col-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <span className="span input-group-prepend input-group-text">
              {" "}
              <i className="fa fa-search"></i>
            </span>
          </div>
        </div>
      </div>
      {/* Zona lista pantallas grandes */}
      <div className="table-responsive d-none d-sm-none d-md-block">
        {
          loading ?
            (
              <ReactLoading
                type="bars"
                color="#0D6EFD"
                height={667}
                width={375}
              />
            )
            :
            (
              <table data-toggle="table" className="table table-striped table-hover "
                data-toolbar="#toolbar"
                data-filter-control="true"
                data-filter-control-container="#filter"
              >
                <thead className="tableStyle">
                  <tr>
                    <th className="thTableId">Venta #</th>
                    <th className="thTable" style={{ "width": "50%" }}>Cliente</th>
                    <th className="thTable">Total venta</th>
                    <th className="thTable">Estado</th>
                    <th className="" style={{width:"380px"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((venta) => {
                    return (
                      <FilaVenta
                        key={nanoid()}
                        venta={venta}
                        setEjecutarConsultaVentas={setEjecutarConsultaVentas}
                      />
                    );
                  })}
                </tbody>
              </table>
            )
        }
      </div>
      {/* Zona lista movil */}
      {ventasFiltradas.map((el) => {
        return (
          <div className="card d-block d-sm-block d-md-none"  style={{margin:"10px 0px"}}>
            <img
              className="card-img-top"
              src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_17c80916396%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_17c80916396%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22107.1953125%22%20y%3D%2296.3%22%3E286x180%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"
              alt={el.descripcion} style={{ "height": "100px" }}
            />
            <div className="card-body">
              <h5 className="card-title">{el._id} </h5>
              <p className="card-text">
                <span>{el.cliente.nombre}</span><br/>
                <span>{el.cliente.tipo_documento}:{el.cliente.documento}</span><br/>
                <span>{el.total_venta} </span><br />
                <span>{el.estado} </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

//FILA VENTAS
const FilaVenta = ({ venta, setEjecutarConsultaVentas }) => {
  const [edit, setEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  //const [totalVenta, SetTotalVenta]=useState(0); 
  const [infoNuevoVenta, setInfoNuevoVenta] = useState({
    _id: venta._id,
    tipo_documento: venta.cliente.tipo_documento,
    documento: venta.cliente.documento,
    cliente: venta.cliente.nombre,
    total_venta: venta.total_venta,
    estado: venta.estado,
  });

   const actualizarVenta = async () => {
    //enviar la info al backend

    await updateSale(
      venta._id,
      {
        cliente: {
          "tipo_documento": infoNuevoVenta.tipo_documento,
          "documento": infoNuevoVenta.documento,
          "nombre": infoNuevoVenta.cliente
        },
        estado: infoNuevoVenta.estado,
      },
      (response) => {
        toast.success('Venta modificada con éxito');
        setEdit(false);
        setEjecutarConsultaVentas(true);
      },
      (error) => {
        toast.error('Error modificando la venta');
        console.error(error);
      }
    );
  };

  const eliminarVenta = async () => {
    await deleteSale(
      venta._id,
      (response) => {
        toast.success('Venta eliminada con éxito');
        setEjecutarConsultaVentas(true);
      },
      (error) => {
        console.error(error);
        toast.error('Error eliminando la venta');
      }
    );

    setOpenDialog(false);
  };

  return (
    <tr>
      {edit ? (
        <>
          <td>{infoNuevoVenta._id.slice(20)}</td>
          <td>
            <label htmlFor="tipo_documento_cliente" className="form-label">Tipo identificación</label>
            <select defaultValue="Cedula de ciudadania" className="form-control"
              className='form-control rounded-lg'
              value={infoNuevoVenta.tipo_documento}
              onChange={(e) => setInfoNuevoVenta({ ...infoNuevoVenta, tipo_documento: e.target.value })}
            >
              <option disabled value="">Seleccion tipo ID</option>
              <option value="NIT">NIT</option>
              <option value="Cedula de ciudadania">Cedula de ciudadania</option>
              <option value="Cedula de extranjeria">Cedula de extranjeria</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="NUIP">NUIP</option>
            </select>
            <label htmlFor="documento_cliente" className="form-label"># Identificación</label>
            <input
              type="text"
              style={{ textTransform: 'uppercase' }}
              className="form-control rounded-lg"
              placeholder="Número de identificación"
              value={infoNuevoVenta.documento}
              onChange={(e) => setInfoNuevoVenta({ ...infoNuevoVenta, documento: e.target.value })}
              required />
            <label htmlFor="nombre_cliente" className="form-label">Nombre cliente</label>
            <input
              className='form-control rounded-lg'
              type='text' style={{ textTransform: 'uppercase' }}
              value={infoNuevoVenta.cliente}
              onChange={(e) => setInfoNuevoVenta({ ...infoNuevoVenta, cliente: e.target.value })}
            />
          </td>
          <td>{infoNuevoVenta.total_venta}</td>
          <td>
            <select className="form-control rounded-lg" defaultValue=""
              value={infoNuevoVenta.estado}
              onChange={(e) =>
                setInfoNuevoVenta({ ...infoNuevoVenta, estado: e.target.value })
              }>
              <option disabled value="">Seleccione opción</option>
              <option value="En proceso">En proceso</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Entregada">Entregada</option>
            </select>
          </td>
        </>
      ) : (
        <>
          <td>{venta._id.slice(20)}</td>
          <td>{venta.cliente.nombre}</td>
          <td>{venta.total_venta}</td>
          <td>{venta.estado}</td>
        </>
      )}
      <td>
        <div style={{width:"150px",textAlign:"center"}}>
          { edit ? (
            <>

              <button type="button" className="btn btn-success buttonTable" title="Confirmar Edición" onClick={() => actualizarVenta()}>
                <i className="fas fa-check "></i>
              </button>
              <button type="button" className="btn btn-danger buttonTable" title='Cancelar edición' onClick={() => setEdit(!edit)}>
                <i className="fas fa-ban"></i>
              </button>
            </>
          ):(
            <>
              <button type="button" className="btn btn-success buttonTable">
                <i className="fa fa-eye"></i>
              </button>
              <button type="button" onClick={() => infoNuevoVenta.estado!="Entregada" && infoNuevoVenta.estado!="Cancelada" ? (setOpenDialog(true)):(toast.error("La venta no se puede eliminar"))} className="btn btn-danger buttonTableTrash">
                <i className="fas fa-trash-alt"></i>
              </button>
              <button type="button" className="btn btn-primary buttonTable" title='Editar Venta' onClick={() => infoNuevoVenta.estado!="Entregada" && infoNuevoVenta.estado!="Cancelada" ? (setEdit(!edit)):(toast.error("La venta no se puede modificar"))}>
                <i className="fas fa-pencil-alt"></i>
              </button>
            </>
          )}
        </div>
        <Dialog open={openDialog}>
          <div>
            <h1 className='text-gray font-bold'>
              ¿Está seguro de querer eliminar la venta?
            </h1>
            <div className='justify-center my-4'>
              <button
                onClick={() => eliminarVenta()}
                className='mx-2 px-4 py-2 btn btn-success text-white rounded-md shadow-md'
              >
                Sí
              </button>
              <button
                onClick={() => setOpenDialog(false)}
                className='mx-2 px-4 py-2 btn btn-danger text-white rounded-md shadow-md'
              >
                No
              </button>
            </div>
          </div>
        </Dialog>
      </td>
    </tr>
  );
};


//FORMULARIO VENTAS
const FormularioCreacionVentas = ({ setMostrarTabla, vendedores, productos, setProductos, totalVenta, setTotalVenta,productosTabla,setProductosTabla, listaVentas, setVentas }) => {
  const curr = new Date();
  curr.setDate(curr.getDate() - 1);
  const fechaVenta = curr.toISOString().substr(0, 10);
  curr.setDate(curr.getDate() + 30);
  const fechaVentaVencimiento = curr.toISOString().substr(0, 10);

  const form = useRef(null);

  const submitForm = async (e) => {
    e.preventDefault();
    const fd = new FormData(form.current);
    const datosFormulario = {} ;//{};//ojo
    const listaProductos =[];
    var conte = 0;
    var totalizando=0;
    fd.forEach((value, key) => {
      datosFormulario[key] = value;
      //console.log("el for"+key.includes("producto_"))
      var list =[0]
      if(key.includes("producto_"))
      {
        //console.log(productos.filter((pro) => pro._id === datosFormulario[key]));
        const lsto = productos.filter((pro) => pro._id === datosFormulario[key]);
        //console.log("prod " + JSON.stringify(lsto[0]["nombre"]));
        //console.log("yo soy "+JSON.stringify(lsto));

        var file = {_id: ''+datosFormulario[key], producto: ''+lsto[0]["nombre"], precio_unitario: ''+lsto[0]["precio"], cantidad:''+datosFormulario["cantidad_"+conte]};
        listaProductos.push(file);
        totalizando=totalizando+ (parseFloat(lsto[0]["precio"]) * parseFloat(datosFormulario["cantidad_"+conte]))
        conte = conte+1;
      }
    });
   
    await createSale(
      {
        fecha_venta: datosFormulario.fecha_venta,
        fecha_vencimiento: datosFormulario.fecha_vencimiento,
        vendedor: vendedores.filter((ventor) => ventor._id === datosFormulario.vendedor)[0],
        cliente: {
          "tipo_documento": datosFormulario.tipo_documento_cliente,
          "documento": datosFormulario.documento_cliente,
          "nombre": datosFormulario.nombre_cliente.toUpperCase(),
        },
        detalles_venta: listaProductos,
        total_venta: totalizando,//datosFormulario.valor,
        estado:"",
      },
      (response) => {
        toast.success('Venta agregada con éxito');
      },
      (error) => {
        console.error(error);
        toast.error('Error creando venta');
      }
   );
    setMostrarTabla(true);
  };
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <form ref={form} onSubmit={submitForm} className='row g-3'>
        <div className="col-md-2">
          <label htmlFor="fecha_venta" className="form-label">Fecha venta</label>
          <input name="fecha_venta" type="date" className="form-control" placeholder="Fecha de venta" min={fechaVenta} max={fechaVenta} defaultValue={fechaVenta} required />
        </div>
        <div className="col-md-2">
          <label htmlFor="fecha_vencimiento" className="form-label">Fecha vencimiento</label>
          <input name="fecha_vencimiento" type="date" className="form-control" placeholder="" min={fechaVenta} defaultValue={fechaVentaVencimiento} required />
        </div>
        <div className="col-md-8">
          <label htmlFor="vendedor" className="form-label">Vendedor</label>
          <select name="vendedor" className="form-control" defaultValue="" required>
            <option disabled value="">Seleccione un Vendedor</option>
            {vendedores && vendedores.map((el) => {
              return <option key={nanoid()} value={el._id}>{el.nombre|| 'VENTAS'} {el.apellido || 'POR INTERNET - ' + el.email}</option>;
            })}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="tipo_documento_cliente" className="form-label">Tipo identificación</label>
          <select name="tipo_documento_cliente" defaultValue="Cedula de ciudadania" className="form-control" required>
            <option disabled value="">Seleccion tipo ID</option>
            <option value="NIT">NIT</option>
            <option value="Cedula de ciudadania">Cedula de ciudadania</option>
            <option value="Cedula de extranjeria">Cedula de extranjeria</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="NUIP">NUIP</option>
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="documento_cliente" className="form-label"># Identificación</label>
          <input name="documento_cliente" type="text" style={{ textTransform: 'uppercase' }} className="form-control" placeholder="Número de identificación" required />
        </div>
        <div className="col-md-7">
          <label htmlFor="nombre_cliente" className="form-label">Cliente</label>
          <input name="nombre_cliente" type="text" style={{ textTransform: 'uppercase' }} className="form-control" placeholder="Nombre cliente" required />
        </div>
        <TablaProductos
          productos={productos}
          setProductos={setProductos}
          setProductosTabla={setProductosTabla}
        />
        <div className="col-md-3" hidden>
          <label htmlFor="valor" className='form-label'>Valor Total Venta</label>
          <input
            className='form-control'
            type='number'
            name='valor'
            defaultValue={0}
            value={totalVenta || 1}
            min={1}
            required
          />
        </div>
        <div className="col-md-3">
        <label htmlFor="submit" className='form-label'> &nbsp; </label>
        <button
          type='submit'
          className='form-control btn btn-primary'
        >
          Crear Venta
        </button>
        </div>
      </form>
    </div>
  );
};

//DETALLES VENTAS
const TablaProductos = ({ productos, setProductos,setProductosTabla}) => {
  const [productoAAgregar, setProductoAAgregar] = useState({});
  const [filasTabla, setFilasTabla] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);

  useEffect(() => {
    // setProductosTabla(filasTabla)
    setProductosTabla={filasTabla}
  }, [filasTabla, setProductosTabla]);

  const agregarNuevoProducto = () => {
    if (JSON.stringify(productoAAgregar).length>2) {
      setFilasTabla([...filasTabla, productoAAgregar]);
      //setProductos(productos.filter((v) => v._id !== productoAAgregar._id));//si se desea eliminar el producto del select
      setProductoAAgregar({});
     }
  };

  const eliminarProducto = (productoAEliminar) => {
    setFilasTabla(filasTabla.filter((v) => v._id !== productoAEliminar._id));
    //setProductos([...productos, productoAEliminar]); //si se esta utilizando elminiar el producto del select
  };

  const modificarProducto = (producto, cantidad) => {
    setFilasTabla(
      filasTabla.map((ft) => {
        if (ft._id === producto.id) {
          ft.cantidad = cantidad;
          ft.total = producto.precio * cantidad;
        }
        return ft;
      })
    );
  };

  //funciona esta parte
  document.querySelectorAll('.Total').forEach(function (totalf) {
    if (totalf.classList.length > 0) {
        //var letra = totalf.classList[1];
        var suma = 0;
        var valor = 0
        //document.querySelectorAll('.Columna'' + letra).forEach(function (celda) {
        document.querySelectorAll('.ColumnaE').forEach(function (celda) {
            valor = parseFloat(celda.innerHTML);
            suma += valor;
        });
        totalf.innerHTML = suma;
    }
   //fin funciona esta parte 
});

  useEffect(() => {
    let total = 0;
    filasTabla.forEach((f) => {
      console.log("soy la fila " + JSON.stringify(f));
      total = parseFloat(total) + parseFloat(f.precio);//f.total;
    });
    setTotalVenta(total);
    console.log("total venta " + total)
  }, [filasTabla]);

  return (
    <div>
      <div className="bg-secondary text-white">
        <div className="flex-row text-center">DETALLES DE LA VENTA</div>
        <div className="d-flex">
          <div className="p-2 flex-fill">
            <label hidden className="form-label hidden" htmlFor="producto">Producto</label>
            <select
              className="form-control"
              value={productoAAgregar._id ?? ''}
              onChange={(e) =>
                setProductoAAgregar(productos.filter((v) => v._id === e.target.value)[0])
              }
            >
              <option disabled value="">Seleccione un Producto</option>
              {productos && productos.map((el) => {
                return (
                  <option
                    key={nanoid()}
                    value={el._id}
                  >{`${el.nombre} ${el.precio}`}</option>
                );
              })}
            </select>
          </div>
          <div className="p-2 col-md-1">
            <label hidden htmlFor="addVenta" className="form-label hidden"><span>&nbsp;</span></label>
            <button name="addVenta" type="button"
              onClick={() => agregarNuevoProducto()}
              className="form-control btn btn-primary btn-block">
              <i className="fas fa-plus-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <table className='table'>
        <thead>
          <tr>
            <th hidden>Id</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Eliminar</th>
            <th hidden className='hidden'>Input</th>
          </tr>
        </thead>
        <tbody>
          {filasTabla.map((el, index) => {
            return (
              <FilaProducto
                key={el._id}
                veh={el}
                index={index}
                eliminarProducto={eliminarProducto}
                modificarProducto={modificarProducto}
              />
            );
          })}
          <tr>
            <td hidden></td>
            <td></td>
            <td></td>
            <td>TOTAL VENTA</td>
            <td className="Total"></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const FilaProducto = ({ veh, index, eliminarProducto, modificarProducto }) => {
  const [producto, setProducto] = useState(veh);
  useEffect(() => {
    //console.log('Fila producto veh', producto);
  }, [producto]);
  return (
    <tr>
      <td hidden>{producto._id}</td>
      <td>{producto.nombre}</td>
      <td>{producto.precio}</td>
      <td>
        <label htmlFor={`valor_${index}`}>
          <input
            type='number'
            name={`cantidad_${index}`}
            value={producto.cantidad}
            defaultValue={1}
            min={1}
            onChange={(e) => {
              modificarProducto(producto, e.target.value === '' ? '1' : e.target.value);
              setProducto({
                ...producto,
                cantidad: e.target.value === '' ? 1 : e.target.value,
                total: parseFloat(producto.precio) * parseFloat(e.target.value === '' ? 1 : e.target.value),
              });
            }}
          />
        </label>
      </td>
      <td className="ColumnaE">{parseFloat(producto.total ?? producto.precio)}</td>
      <td>
        <i
          onClick={() => eliminarProducto(producto)}
          className='fas fa-minus text-red-500 cursor-pointer'
        />
      </td>
      <td className='hidden'>
        <input hidden defaultValue={producto._id} name={`producto_${index}`} />
      </td>
    </tr>
  );
};
