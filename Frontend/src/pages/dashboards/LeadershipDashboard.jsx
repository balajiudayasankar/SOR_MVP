import Breadcrumb from "../../components/common/Breadcrumb";

const LeadershipDashboard = () => {
  return (
    <div className="ada-dashboard">
      <Breadcrumb items={[{ label: "Leadership Dashboard" }]} />
      
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        margin: '2rem 0'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          👋 Welcome to Leadership Dashboard
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          Manage users, roles, departments, and change requests
        </p>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h3>🚀 Ready to get started?</h3>
        <p>Navigation menu available on the left sidebar</p>
      </div>
    </div>
  );
};

export default LeadershipDashboard;
