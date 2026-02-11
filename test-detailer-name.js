// Test to verify detailer name logic

const mockDetailer = {
  role: 'detailer',
  name: 'John Doe',
  businessName: 'Elite Auto Detailing',
  email: 'john@example.com',
  phone: '555-0123'
};

const mockClient = {
  role: 'client',
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-0456'
};

// Simulate WebLayout logic
function getDisplayName(user) {
  const userRole = user.role;
  const userName = user.name;
  const businessName = user.businessName;
  
  const displayName = userRole === 'detailer' && businessName ? businessName : userName;
  const accountType = userRole === 'client' ? 'Client Account' : 'Detailer Account';
  
  return { displayName, accountType };
}

console.log('Detailer:', getDisplayName(mockDetailer));
// Expected: { displayName: 'Elite Auto Detailing', accountType: 'Detailer Account' }

console.log('Client:', getDisplayName(mockClient));
// Expected: { displayName: 'Jane Smith', accountType: 'Client Account' }
