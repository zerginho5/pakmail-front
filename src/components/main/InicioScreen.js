
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { makeDELETE, makeGET, makePATCH, makePOST } from "../../helpers/makeRequest";
import Select from "react-select";
import DataTable from 'react-data-table-component';
import { conf } from '../../config/config'
import 'react-phone-number-input/style.css'
import Swal from "sweetalert2";
import TextField from '@mui/material/TextField'
import { Box } from "@mui/material/Box";

export const InicioScreen = () => {
  const user = useSelector((state) => state.auth);
  useEffect(() => {
    getDatos();
  }, []);
  const [datos, setDatos] = useState([]);
  const [selected, setSelected] = useState([])
  const [toggleCleared, setToggleCleared] = useState(false);

  const [desc, setDesc] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [duracion, setDuracion] = useState("");
  const [tempObj, setTemp] = useState(undefined);
  const [adding, setAdding] = useState(false);

  const handleRowSelected = useCallback(state => {
    console.log(state)
    setSelected(state.selectedRows);
  }, []);

  const [form, setForm] = useState({
    mx: undefined,
    name: undefined,
    state: undefined,
    phone: undefined,
    phone2: undefined,
    address: undefined,
    email: undefined,
    lat: undefined,
    lng: undefined,
    coordinates: [undefined, undefined],
    sitio: undefined,
    cotiza: undefined
  })

  const customStyles = {
    headRow: {
      style: {
        border: 'none',
      },
    },
    headCells: {
      style: {
        color: '#202124',
        fontSize: '14px',
        fontWeight: "bolder"
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: 'rgb(230, 244, 244)',
        borderBottomColor: '#FFFFFF',
        borderRadius: '25px',
        outline: '1px solid #FFFFFF',
      },
    },
    pagination: {
      style: {
        border: 'none',
      },
    },
  };

  const isLatitude = num => isFinite(num) && Math.abs(num) <= 90 && String(num).length != 0;
  const isLongitude = num => isFinite(num) && Math.abs(num) <= 180 && String(num).length != 0;

  const contextActions = useMemo(() => {
    const handleDelete = () => {
      Swal.fire("Atención", "¿Estás seguro que quieres eliminar los registros seleccionados? " + selected.map(r => " " + r.name), "warning")
        .then((result) => {
          if (result.isConfirmed) {
            deleteDatos(selected.map(r => r.id))
            setToggleCleared(!toggleCleared)
          }
        })
    };

    const handleEdit = () => {
      setForm({ ...selected[0], phone: String(selected[0].phone).replace(/\D/g, ""), phone2: String(selected[0].phone2).replace(/\D/g, "") })
      setToggleCleared(!toggleCleared)
      setFlag(true)
      setAdding(true)
    };

    return (
      <>
        {selected.length == 1 &&
          <button key="update" onClick={handleEdit} className="btn btn-sm btn-primary mr-1">
            <i className="fas fa-edit"></i>
          </button>
        }
        <button key="delete" onClick={handleDelete} className="btn btn-sm btn-danger">
          <i className="fas fa-trash"></i>
        </button>
      </>
    );
  }, [datos, selected, toggleCleared]);

  const [flag, setFlag] = useState(false)
  const columns = [
    {
      name: 'MX',
      selector: row => row.mx,
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'State',
      selector: row => row.state,
      sortable: true,
    },
    {
      name: 'Sitio',
      selector: row => row.sitio,
      sortable: true,
    },
  ];

  const getDatos = async () => {
    makeGET("locations").then(({ data }) => setDatos(data.datos)).catch((e) => console.log(e))
  };

  const createDatos = async () => {
    makePOST("locations", { ...form, phone: formatPhone(form.phone), phone2: formatPhone(form.phone2) }).then((v) => {
      getDatos()
      resetForm()
      Swal.fire("Éxito!", "Registro agregado", "success")
    }).catch((c) => {
      Swal.fire("Error", "Ocurrió un error", "error")
    })
  }

  const resetForm = () => {
    Object.keys(form).map((key) => {
      form[key] = undefined
      if (key == "coordinates") {
        form[key] = [undefined, undefined]
      }
    })
    console.log(form)
  }

  const updateDatos = async (val) => {
    makePATCH("locations", { ...form, phone: formatPhone(form.phone), phone2: formatPhone(form.phone2) }).then((v) => {
      getDatos()
      setFlag(false)
      setAdding(false)
      resetForm()
      Swal.fire("Éxito!", "Registro agregado", "success")
    }).catch((c) => {
      Swal.fire("Error", "Ocurrió un error", "error")
    })
  };

  const deleteDatos = async (val) => {
    makeDELETE("locations", { ids: val }).then((v) => {
      getDatos()
      setSelected([])
      Swal.fire("Éxito!", "Borrado completado", "success")
    }).catch((c) => {
      Swal.fire("Error", "Ocurrió un error", "error")
    })
  };

  const formatPhone = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      var intlCode = (match[1] ? '+1 ' : '');
      return [intlCode, match[2], ' ', match[3], ' ', match[4]].join('');
    }
    return phoneNumberString;
  }

  const checkPhone = (phoneNumberString) => {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return true
    }
    return false
  }

  const resetValues = () => {
    setDesc("");
    setFechaFin("");
    setDuracion("");
  };

  const toggleAdd = () => {
    setTemp(undefined);
    setAdding(true);
    resetValues();
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const undReturn = (val) => {
    if (val == undefined) {
      return ""
    }
    return val
  }

  const toggleClose = () => {
    setTemp(undefined);
    setAdding(false);
    resetValues();
  };

  const checkForm = () => {
    if (form.mx?.length == 0 || form.name?.length == 0 || form.state?.length == 0 || form.state?.length == 0
      || !validateEmail(form.email) || form.address?.length == 0 || !checkPhone(form.phone) || !checkPhone(form.phone2)
      || !(isLatitude(form.lat)) || !(isLongitude(form.lng)) || form.sitio?.length == 0 || form.cotiza?.length == 0) {
      return true
    }
    return false
  }

  return (
    <>
      <div className="card m-3">
        <h5 className="card-header d-flex justify-content-between align-items-center">
          PakMail
          {adding ? (
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                toggleClose()
                if (flag) {
                  resetForm()
                }
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => toggleAdd()}
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </h5>
        {adding && (
          <div className="card-body row">
            <div className="col-12 col-lg-6 text-center mb-3">
              {/* <div className="input-group input-group-sm p-0 m-0">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">MX</span>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, mx: e.target.value })
                  }}
                  value={undReturn(form.mx)}
                  autoComplete="off"
                  placeholder="MX248"
                  required
                />

              </div>
              {(form.mx?.length == 0 && form.mx != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El campo mx es requerido</small>
              } */}
              <TextField
                type="text"
                className="form-control form-control-sm"
                size="small"
                onChange={(e) => {
                  setForm({ ...form, mx: e.target.value })
                }}
                value={undReturn(form.mx)}
                label="MX"
                autoComplete="off"
                placeholder="MX248"
                required
                variant="outlined"
              />
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <TextField
                type="text"
                className="form-control form-control-sm"
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value })
                }}
                value={undReturn(form.name)}
                autoComplete="off"
                placeholder="PakMail..."
                required
                size="small"
                variant="outlined"
                label="Name"
              />
              {/* <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Name</span>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                  }}
                  value={undReturn(form.name)}
                  autoComplete="off"
                  placeholder="PakMail..."
                  required
                />
              </div>
              {(form.name?.length == 0 && form.name != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El campo name es requerido</small>
              } */}
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                {/* <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">State</span>
                </div> */}
                <div className="react-select form-control p-0 h-100">
                  <Select
                    options={conf.states.map(r => { return { value: r.name, label: r.name } })}
                    value={{ value: undReturn(form.state), label: undReturn(form.state) }}
                    autoFocus={false}
                    isSearchable={true}
                    onChange={(e) => {
                      setForm({ ...form, state: e.value })
                    }}
                    placeholder={"State..."}
                  />
                </div>
              </div>
              {(form.state?.length == 0 && form.state != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El state es requerido</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              {/* <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Email</span>
                </div>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                  }}
                  value={undReturn(form.email)}
                  autoComplete="off"
                  placeholder="pakmail@..."
                  required
                />
              </div>
              {(!validateEmail(form.email) && form.email != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>Formato de email no válido</small>
              } */}
              <TextField
                type="email"
                className="form-control form-control-sm"
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value })
                }}
                value={undReturn(form.email)}
                autoComplete="off"
                placeholder="pakmail@..."
                required
                error={(!validateEmail(form.email) && form.email != undefined)}
                helperText={(!validateEmail(form.email) && form.email != undefined) && "Formato de email no válido"}
                size="small"
                variant="outlined"
                label="Email"
                style={{marginBottom: (!validateEmail(form.email) && form.email != undefined) && '15px'}}
              />
            </div>
            <div className="col-12 text-center mb-3">
              {/* <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '12.5%' }}>
                  <span className="input-group-text w-100">Address</span>
                </div>
                <textarea
                  type="text"
                  rows="1"
                  className="form-control form-control-sm"
                  style={{ resize: "none" }}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value })
                  }}
                  value={undReturn(form.address)}
                  autoComplete="off"
                  placeholder="Calle #1 Colonia, Ciudad, Estado, CP"
                  required
                />
              </div>
              {(form.address?.length == 0 && form.address != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El campo address es requerido</small>
              } */}
              <TextField
                  type="text"
                  rows="1"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value })
                  }}
                  value={undReturn(form.address)}
                  autoComplete="off"
                  placeholder="Calle #1 Colonia, Ciudad, Estado, CP"
                  required
                  multiline
                  error={(form.address?.length == 0 && form.address != undefined)}
                  helperText={(form.address?.length == 0 && form.address != undefined) && "El campo address es requerido"}
                  size="small"
                  variant="outlined"
                  label="Address"
                  style={{ marginBottom: (form.address?.length == 0 && form.address != undefined) && '15px' }}
                />
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Phone</span>
                </div>
                <input
                  type={form.phone?.length < 10 ? "number" : "text"}
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, phone: String(e.target.value).substring(0, 12) })
                  }}
                  maxLength="12"
                  value={form.phone?.length < 10 ? form.phone : (form.phone?.length == 10 ?
                    formatPhone(form.phone) : String(form.phone).replace(/\D/g, ""))}
                  autoComplete="off"
                  placeholder="555 555 5555"
                  required
                />
                {/* <Input
                    value={form.phone}
                    onChange={(e) => { setForm({ ...form, phone: e }) }}
                    inputComponent={() =>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        onChange={(e) => {
                          setForm({ ...form, phone2: String(e.target.value).substring(0, 14) })
                        }}
                        pattern="^[0-9]*$"
                        value={formatPhone(form.phone2)}
                        autoComplete="off"
                        required
                      />
                    }
                  /> */}
              </div>
              {(!checkPhone(form.phone) && form.phone != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>Formato de phone no válido</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Phone 2</span>
                </div>
                <input
                  type={form.phone2?.length < 10 ? "number" : "text"}
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, phone2: String(e.target.value).substring(0, 12) })
                  }}
                  maxLength="12"
                  value={form.phone2?.length < 10 ? form.phone2 : (form.phone2?.length == 10 ?
                    formatPhone(form.phone2) : String(form.phone2).replace(/\D/g, ""))}
                  autoComplete="off"
                  placeholder="444 444 4444"
                  required
                />
              </div>
              {(!checkPhone(form.phone2) && form.phone2 != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>Formato de phone2 no válido</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Lat</span>
                </div>
                <input
                  type="number"
                  step={0.000001}
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, lat: e.target.value })
                  }}
                  value={undReturn(form.lat)}
                  autoComplete="off"
                  placeholder="19.5..."
                  required
                />
              </div>
              {(!(isLatitude(form.lat)) && form.lat != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>La lat es inválida</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Lng</span>
                </div>
                <input
                  type="number"
                  step={0.000001}
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, lng: e.target.value })
                  }}
                  value={undReturn(form.lng)}
                  autoComplete="off"
                  placeholder="19.5..."
                  required
                />
              </div>
              {(!(isLongitude(form.lng)) && form.lng != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>La lng es inválida</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Sitio</span>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, sitio: e.target.value })
                  }}
                  value={undReturn(form.sitio)}
                  autoComplete="off"
                  placeholder="pakmail.com"
                  required
                />
              </div>
              {(form.sitio?.length == 0 && form.sitio != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El sitio es requerido</small>
              }
            </div>
            <div className="col-12 col-lg-6 text-center mb-3">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend" style={{ width: '25%' }}>
                  <span className="input-group-text w-100">Cotiza</span>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    setForm({ ...form, cotiza: e.target.value })
                  }}
                  value={undReturn(form.cotiza)}
                  autoComplete="off"
                  placeholder="pakmail.com/cotiza"
                  required
                />
              </div>
              {(form.cotiza?.length == 0 && form.cotiza != undefined) &&
                <small style={{ fontSize: '12px', fontWeight: 'bolder', color: 'red' }}>El campo cotiza es requerido</small>
              }
            </div>
            <div className="col-12 text-center mt-2">
              <button
                type="button"
                className={"btn btn-large " + (flag ? "btn-success" : "btn-primary")}
                onClick={flag ? updateDatos : createDatos}
                disabled={checkForm()}
                style={{
                  paddingLeft: "2.5rem",
                  paddingRight: "2.5rem",
                  fontSize: "18px",
                }}
              >
                {flag ? "Modificar" : "Añadir"}
              </button>
            </div>
          </div>
        )}
        <div className="card-body row m-0 pt-0 pb-0 pl-1 pr-1">
          <div className="col-12 m-0 p-0">
            <DataTable
              title="Sucursales"
              columns={columns}
              data={datos}
              selectableRows
              customStyles={customStyles}
              contextActions={contextActions}
              onSelectedRowsChange={handleRowSelected}
              clearSelectedRows={toggleCleared}
              pagination
              responsive
            />
          </div>
        </div>
      </div>
    </>
  );
};
