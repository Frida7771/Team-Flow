export const errorMiddleware = (error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  
  if (error.message === 'Authentication required') {
    return res.status(401).json({ error: error.message });
  }
  
  if (error.message.includes('not found')) {
    return res.status(404).json({ error: error.message });
  }
  
  if (error.message.includes('already exists')) {
    return res.status(409).json({ error: error.message });
  }
  
  if (error.message.includes('Invalid credentials')) {
    return res.status(401).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};
