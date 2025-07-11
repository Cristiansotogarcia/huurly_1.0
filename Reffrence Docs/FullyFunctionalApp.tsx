import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
}

interface Application {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

// Mock data
const mockUser: User = {
  id: '1',
  email: 'sotocrioyo@gmail.com',
  firstName: 'Cristian',
  lastName: 'Soto Garcia',
  role: 'huurder',
  subscription: {
    plan: 'basic',
    status: 'active',
    expiresAt: '2025-08-09'
  }
};

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Amsterdam',
    location: 'Amsterdam, Noord-Holland',
    price: 1500,
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    description: 'Beautiful modern apartment in the heart of Amsterdam with great public transport connections.'
  },
  {
    id: '2',
    title: 'Cozy Studio in Utrecht',
    location: 'Utrecht, Utrecht',
    price: 900,
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    description: 'Compact but well-designed studio apartment perfect for students or young professionals.'
  },
  {
    id: '3',
    title: 'Family House in Rotterdam',
    location: 'Rotterdam, Zuid-Holland',
    price: 2200,
    type: 'House',
    bedrooms: 4,
    bathrooms: 2,
    area: 120,
    description: 'Spacious family house with garden, perfect for families with children.'
  }
];

const mockApplications: Application[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Modern Apartment in Amsterdam',
    status: 'pending',
    submittedAt: '2025-07-05'
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Cozy Studio in Utrecht',
    status: 'approved',
    submittedAt: '2025-07-01'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    from: 'landlord@example.com',
    subject: 'Application Update',
    content: 'Your application for the Amsterdam apartment has been received and is under review.',
    timestamp: '2025-07-06 10:30',
    read: false
  },
  {
    id: '2',
    from: 'support@huurly.com',
    subject: 'Welcome to Huurly!',
    content: 'Welcome to Huurly! Complete your profile to get better matches.',
    timestamp: '2025-07-01 09:00',
    read: true
  }
];

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'ID Document',
    type: 'identification',
    status: 'verified',
    uploadedAt: '2025-07-01'
  },
  {
    id: '2',
    name: 'Income Statement',
    type: 'income',
    status: 'pending',
    uploadedAt: '2025-07-05'
  }
];

// Login Form Component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (email === 'sotocrioyo@gmail.com' && password === 'Admin1290@@') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/huurder-dashboard');
    } else {
      alert('Invalid credentials. Use: sotocrioyo@gmail.com / Admin1290@@');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to Huurly</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="sotocrioyo@gmail.com"
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Admin1290@@"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#ff6600', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { path: '/huurder-dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/properties', label: 'Properties' },
    { path: '/applications', label: 'Applications' },
    { path: '/messages', label: 'Messages' },
    { path: '/documents', label: 'Documents' },
    { path: '/subscription', label: 'Subscription' }
  ];

  return (
    <nav style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <h2 style={{ margin: 0, color: '#ff6600' }}>Huurly</h2>
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '8px 16px',
              backgroundColor: location.pathname === item.path ? '#ff6600' : 'transparent',
              color: location.pathname === item.path ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button 
        onClick={handleLogout}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </nav>
  );
};

// Dashboard Component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome back, {user.firstName}!</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3>Quick Stats</h3>
          <p>Active Applications: {mockApplications.filter(app => app.status === 'pending').length}</p>
          <p>Unread Messages: {mockMessages.filter(msg => !msg.read).length}</p>
          <p>Subscription: {user.subscription?.plan} ({user.subscription?.status})</p>
        </div>
        
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3>Recent Activity</h3>
          <p>• Application submitted for Amsterdam apartment</p>
          <p>• New message from landlord</p>
          <p>• Document verification pending</p>
        </div>
        
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3>Next Steps</h3>
          <p>• Complete your profile</p>
          <p>• Upload income verification</p>
          <p>• Respond to landlord message</p>
        </div>
      </div>
    </div>
  );
};

// Profile Management Component
const ProfileManagement = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile Management</h1>
      
      <div style={{ maxWidth: '600px', marginTop: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>First Name:</label>
          <input
            type="text"
            value={user.firstName || ''}
            onChange={(e) => setUser({...user, firstName: e.target.value})}
            disabled={!isEditing}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              backgroundColor: isEditing ? 'white' : '#f5f5f5'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Last Name:</label>
          <input
            type="text"
            value={user.lastName || ''}
            onChange={(e) => setUser({...user, lastName: e.target.value})}
            disabled={!isEditing}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              backgroundColor: isEditing ? 'white' : '#f5f5f5'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={user.email || ''}
            disabled={true}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              backgroundColor: '#f5f5f5'
            }}
          />
          <small>Email cannot be changed</small>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Property Search Component
const PropertySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = !maxPrice || property.price <= parseInt(maxPrice);
    const matchesType = !propertyType || property.type === propertyType;
    
    return matchesSearch && matchesPrice && matchesType;
  });

  const handleApply = (propertyId: string) => {
    alert(`Application submitted for property ${propertyId}! You will be redirected to the applications page.`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Property Search</h1>
      
      {/* Search Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: '120px', padding: '8px' }}
        />
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          style={{ width: '120px', padding: '8px' }}
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Studio">Studio</option>
          <option value="House">House</option>
        </select>
      </div>
      
      {/* Property Listings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {filteredProperties.map(property => (
          <div key={property.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <h3>{property.title}</h3>
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Price:</strong> €{property.price}/month</p>
            <p><strong>Type:</strong> {property.type}</p>
            <p><strong>Details:</strong> {property.bedrooms} bed, {property.bathrooms} bath, {property.area}m²</p>
            <p>{property.description}</p>
            <button
              onClick={() => handleApply(property.id)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#ff6600', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
      
      {filteredProperties.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          No properties found matching your criteria.
        </p>
      )}
    </div>
  );
};

// Applications Component
const Applications = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>My Applications</h1>
      
      <div style={{ marginTop: '20px' }}>
        {mockApplications.map(application => (
          <div key={application.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '15px',
            backgroundColor: 'white'
          }}>
            <h3>{application.propertyTitle}</h3>
            <p><strong>Status:</strong> 
              <span style={{ 
                color: application.status === 'approved' ? 'green' : 
                       application.status === 'rejected' ? 'red' : 'orange',
                fontWeight: 'bold',
                marginLeft: '5px'
              }}>
                {application.status.toUpperCase()}
              </span>
            </p>
            <p><strong>Submitted:</strong> {application.submittedAt}</p>
            <div style={{ marginTop: '10px' }}>
              <button style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}>
                View Details
              </button>
              {application.status === 'pending' && (
                <button style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Messages Component
const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Messages</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        {/* Message List */}
        <div>
          <h3>Inbox</h3>
          {mockMessages.map(message => (
            <div 
              key={message.id} 
              onClick={() => setSelectedMessage(message)}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: message.read ? 'white' : '#f0f8ff',
                cursor: 'pointer',
                borderLeft: message.read ? '3px solid #ddd' : '3px solid #ff6600'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{message.from}</div>
              <div>{message.subject}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{message.timestamp}</div>
            </div>
          ))}
        </div>
        
        {/* Message Content */}
        <div>
          {selectedMessage ? (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <h3>{selectedMessage.subject}</h3>
              <p><strong>From:</strong> {selectedMessage.from}</p>
              <p><strong>Date:</strong> {selectedMessage.timestamp}</p>
              <hr />
              <p>{selectedMessage.content}</p>
              <button style={{ 
                padding: '10px 20px', 
                backgroundColor: '#ff6600', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Reply
              </button>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Documents Component
const Documents = () => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (uploadFile) {
      alert(`Document "${uploadFile.name}" uploaded successfully! It will be reviewed within 24 hours.`);
      setUploadFile(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Document Management</h1>
      
      {/* Upload Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Upload New Document</h3>
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '10px' }}
        />
        <button
          onClick={handleUpload}
          disabled={!uploadFile}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: uploadFile ? '#28a745' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: uploadFile ? 'pointer' : 'not-allowed'
          }}
        >
          Upload Document
        </button>
      </div>
      
      {/* Documents List */}
      <div>
        <h3>Your Documents</h3>
        {mockDocuments.map(document => (
          <div key={document.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '15px',
            backgroundColor: 'white'
          }}>
            <h4>{document.name}</h4>
            <p><strong>Type:</strong> {document.type}</p>
            <p><strong>Status:</strong> 
              <span style={{ 
                color: document.status === 'verified' ? 'green' : 
                       document.status === 'rejected' ? 'red' : 'orange',
                fontWeight: 'bold',
                marginLeft: '5px'
              }}>
                {document.status.toUpperCase()}
              </span>
            </p>
            <p><strong>Uploaded:</strong> {document.uploadedAt}</p>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Subscription Component
const Subscription = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    {
      name: 'Basic',
      price: 9.99,
      features: ['5 property applications per month', 'Basic profile', 'Email support']
    },
    {
      name: 'Premium',
      price: 19.99,
      features: ['Unlimited applications', 'Priority profile', 'Phone support', 'Document verification']
    },
    {
      name: 'Pro',
      price: 39.99,
      features: ['Everything in Premium', 'Personal assistant', 'Guaranteed response', 'Premium listings']
    }
  ];

  const handleUpgrade = (planName: string) => {
    alert(`Redirecting to payment for ${planName} plan... (Use iDeal as payment method for testing)`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Subscription Management</h1>
      
      {/* Current Subscription */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h3>Current Subscription</h3>
        <p><strong>Plan:</strong> {user.subscription?.plan || 'Free'}</p>
        <p><strong>Status:</strong> {user.subscription?.status || 'inactive'}</p>
        <p><strong>Expires:</strong> {user.subscription?.expiresAt || 'N/A'}</p>
      </div>
      
      {/* Available Plans */}
      <h3>Available Plans</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map(plan => (
          <div key={plan.name} style={{ 
            border: '2px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <h4>{plan.name}</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6600', margin: '10px 0' }}>
              €{plan.price}/month
            </div>
            <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.name)}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#ff6600', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px'
              }}
            >
              {user.subscription?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
      
      {/* Billing History */}
      <div style={{ marginTop: '40px' }}>
        <h3>Billing History</h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: 'white'
        }}>
          <p>2025-07-01 - Basic Plan - €9.99</p>
          <p>2025-06-01 - Basic Plan - €9.99</p>
          <p>2025-05-01 - Basic Plan - €9.99</p>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

// Main App Component
const FullyFunctionalApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route 
          path="/huurder-dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfileManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <PropertySearch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<div style={{ padding: '20px' }}>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default FullyFunctionalApp;

