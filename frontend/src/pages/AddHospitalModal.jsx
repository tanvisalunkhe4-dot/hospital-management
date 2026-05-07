const AddHospital = ({ onSuccess, onCancel }) => {
  // Matches your backend payload keys exactly
  const [hospitalData, setHospitalData] = useState({
    name: '',
    hfrId: '',
    email: '',
    phone: '',
    category: 'Private',
    type: 'Multi-Specialty',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    bedCapacity: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      // Ensure the payload matches your 'new_hosp' mapping
      await axios.post('http://127.0.0.1:8000/api/v1/superadmin/hospitals/register', hospitalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (error) {
      alert("Registration failed. Check if HFR ID or Email already exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{...modalCardStyle, maxWidth: '850px'}}>
        <div style={modalHeaderStyle}>
          <div style={iconBox}><Building2 color={theme.colors.primary} /></div>
          <h2 style={titleStyle}>Provision Medical Node</h2>
          <button onClick={onCancel} style={closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{...gridStyle, gridTemplateColumns: '1fr 1fr 1fr'}}>
            
            {/* --- Row 1 --- */}
            <div style={inputGroup}>
              <label style={labelStyle}>Facility Name</label>
              <input type="text" placeholder="Ruby Hall Clinic" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, name: e.target.value})} required />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>ABDM HFR ID</label>
              <input type="text" placeholder="HFR-102-XXXX" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, hfrId: e.target.value})} required />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Admin Email</label>
              <input type="email" placeholder="admin@hospital.com" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, email: e.target.value})} required />
            </div>

            {/* --- Row 2 --- */}
            <div style={inputGroup}>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" placeholder="+91 XXXX" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, phone: e.target.value})} required />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Category</label>
              <select style={selectStyle} onChange={(e) => setHospitalData({...hospitalData, category: e.target.value})}>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Trust">Trust</option>
              </select>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Facility Type</label>
              <input type="text" placeholder="Multi-Specialty" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, type: e.target.value})} required />
            </div>

            {/* --- Row 3 --- */}
            <div style={inputGroup}>
              <label style={labelStyle}>City</label>
              <input type="text" placeholder="Pune" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, city: e.target.value})} required />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>State</label>
              <input type="text" placeholder="Maharashtra" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, state: e.target.value})} required />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Bed Capacity</label>
              <input type="number" placeholder="100" style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, bedCapacity: parseInt(e.target.value)})} required />
            </div>

            {/* --- Row 4 --- */}
            <div style={{ ...inputGroup, gridColumn: 'span 3' }}>
              <label style={labelStyle}>Full Physical Address</label>
              <input type="text" placeholder="Building, Street, Area..." style={inputStyle} 
                onChange={(e) => setHospitalData({...hospitalData, address: e.target.value})} required />
            </div>
          </div>

          <div style={{display: 'flex', gap: '16px', marginTop: '20px'}}>
             <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
             <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
               {isSubmitting ? "Syncing..." : "Initialize Hospital"}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
// --- STYLES ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const cardStyle = { maxWidth: '650px', width: '90%', background: '#fff', borderRadius: '24px', padding: '40px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' };
const closeBtn = { position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' };
const headerStyle = { textAlign: 'center', marginBottom: '32px' };
const iconBox = { width: '50px', height: '50px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 };
const subtitleStyle = { fontSize: '14px', color: '#64748b', marginTop: '8px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#334155' };
const inputWrapper = { position: 'relative' };
const inputIcon = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' };
const inputWithIcon = { ...inputStyle, paddingLeft: '40px' };
const selectStyle = { ...inputStyle, appearance: 'none' };
const buttonStyle = { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

export default AddHospital;