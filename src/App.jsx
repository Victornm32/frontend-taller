import { useState, useEffect } from 'react';

function App() {
  const [repuestos, setRepuestos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // Para saber si estamos editando
  const [nuevo, setNuevo] = useState({
    categoria: '', nombre_tecnico: '', alias_comun: '',
    stock_actual: 0, stock_minimo: 2, ubicacion: ''
  });

  const generarCodigoAleatorio = () => {
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();
    setNuevo(prev => ({ ...prev, ubicacion: codigo }));
  };

 const cargarRepuestos = async () => {
  try {
    const res = await fetch('https://taller-inventario-1yj3.onrender.com/api/repuestos');
    
    // Si el servidor no responde con datos (por ejemplo, si está despertando), 
    // nos salimos de la función sin romper la app
    if (!res.ok) {
      console.log("Esperando que el servidor despierte...");
      return;
    }

    const datos = await res.json();
    setRepuestos(datos);
  } catch (error) {
    console.error("Error de conexión:", error);
  }
};

  useEffect(() => { cargarRepuestos(); }, []);

  const abrirModalNuevo = () => {
    setEditandoId(null);
    setNuevo({ categoria: '', nombre_tecnico: '', alias_comun: '', stock_actual: 0, stock_minimo: 2, ubicacion: '' });
    generarCodigoAleatorio();
    setMostrarModal(true);
  };

  const abrirModalEditar = (item) => {
    setEditandoId(item.id);
    setNuevo(item); // Carga los datos actuales en el formulario
    setMostrarModal(true);
  };

  const eliminarRepuesto = async (id) => {
    if (window.confirm('¿Eliminar este producto permanentemente?')) {
      await fetch(`https://taller-inventario-1yj3.onrender.com/api/repuestos/${id}`, { method: 'DELETE' });
      cargarRepuestos();
    }
  };

  const ajustarStock = async (id, cantidad) => {
    await fetch(`https://taller-inventario-1yj3.onrender.com/api/repuestos/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    cargarRepuestos();
  };

 const guardarRepuesto = async (e) => {
  e.preventDefault();
  
  // URL correcta apuntando a tu servidor de Render
  const url = editandoId 
    ? `https://taller-inventario-1yj3.onrender.com/api/repuestos/${editandoId}` 
    : 'https://taller-inventario-1yj3.onrender.com/api/repuestos';

  const metodo = editandoId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });

    if (res.ok) {
      alert("¡Guardado con éxito!");
      setMostrarModal(false);
      cargarRepuestos(); // Esto refresca la lista automáticamente
    } else {
      const errorData = await res.json();
      alert("Error del servidor: " + errorData.error);
    }
  } catch (error) {
    console.error("Error al conectar:", error);
    alert("No se pudo conectar con el servidor. Revisa tu conexión.");
  }
};

  const repuestosFiltrados = repuestos.filter(r => 
    r.nombre_tecnico.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.alias_comun.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.ubicacion.includes(busqueda)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ferretería & Taller</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-tighter italic">Control Pro de Inventario</p>
        </div>
        <button onClick={abrirModalNuevo} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest">
          + Nuevo Ingreso
        </button>
      </div>

      <div className="mb-8 relative">
        <input type="text" placeholder="Buscar por nombre, categoría, alias o código..." className="w-full p-4 pl-12 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* Tabla con Editar y Eliminar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-black uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-5">Descripción</th>
              <th className="p-5 text-center">Categoría</th>
              <th className="p-5 text-center">Stock</th>
              <th className="p-5 text-center">Ubicación</th>
              <th className="p-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {repuestosFiltrados.map(r => (
              <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="p-5">
                  <span className="font-black text-gray-800 text-base block">{r.nombre_tecnico}</span>
                  <span className="text-xs text-gray-500 italic font-medium">{r.alias_comun || 'Sin alias'}</span>
                </td>
                <td className="p-5 text-center">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">{r.categoria}</span>
                </td>
                <td className="p-5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => ajustarStock(r.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 font-bold transition-all">-</button>
                    <span className={`text-xl font-black min-w-[30px] ${r.stock_actual <= r.stock_minimo ? 'text-red-600' : 'text-gray-700'}`}>{r.stock_actual}</span>
                    <button onClick={() => ajustarStock(r.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-green-100 font-bold transition-all">+</button>
                  </div>
                </td>
                <td className="p-5 text-center">
                   <div className="font-mono text-blue-700 font-black text-lg bg-gray-100 py-1 px-4 rounded-lg inline-block border border-gray-200">{r.ubicacion}</div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    {/* Botón Editar (Lápiz) */}
                    <button onClick={() => abrirModalEditar(r)} className="p-2 text-blue-300 hover:text-blue-600 transition-colors" title="Editar datos">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    {/* Botón Eliminar (Basura) */}
                    <button onClick={() => eliminarRepuesto(r.id)} className="p-2 text-red-200 hover:text-red-600 transition-colors" title="Eliminar">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL MULTIUSO (Nuevo y Editar) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 border border-white">
            <div className="text-center mb-6">
               <h2 className="text-2xl font-black text-gray-900">{editandoId ? 'Actualizar Artículo' : 'Nuevo Ingreso'}</h2>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mt-1">Completa los datos del estante</p>
            </div>
            <form onSubmit={guardarRepuesto} className="space-y-5">
              <div className="bg-blue-600 p-5 rounded-2xl text-center shadow-xl shadow-blue-300">
                <label className="text-[10px] font-black text-blue-100 uppercase block mb-1 tracking-widest">Código de Ubicación</label>
                <span className="text-5xl font-mono font-black text-white tracking-[12px]">{nuevo.ubicacion}</span>
              </div>
              <input required value={nuevo.nombre_tecnico} placeholder="Nombre del Producto" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none" onChange={e => setNuevo({...nuevo, nombre_tecnico: e.target.value})} />
              <input value={nuevo.alias_comun} placeholder="Marca / Detalle" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none" onChange={e => setNuevo({...nuevo, alias_comun: e.target.value})} />
              <select required value={nuevo.categoria} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none" onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                <option value="">-- Categoría --</option>
                <option value="Bombas Piscina">Bombas Piscina</option>
                <option value="Bombas Hidroneumáticas">Bombas Hidroneumáticas</option>
                <option value="Repuestos de Bombas">Repuestos de Bombas</option>
                <option value="Tuberías y Conexiones">Tuberías y Conexiones</option>
                <option value="Válvulas y Llaves">Válvulas y Llaves</option>
                <option value="Tanques y Presión">Tanques y Presión</option>
                <option value="Filtros y Químicos">Filtros y Químicos</option>
                <option value="Herramientas y Otros">Herramientas y Otros</option>
              </select>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 ml-1 uppercase text-[9px]">Stock Actual</label>
                  <input type="number" required value={nuevo.stock_actual} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-800" onChange={e => setNuevo({...nuevo, stock_actual: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 ml-1 uppercase text-[9px]">Aviso Mínimo</label>
                  <input type="number" required value={nuevo.stock_minimo} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-800" onChange={e => setNuevo({...nuevo, stock_minimo: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Descartar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                  {editandoId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

