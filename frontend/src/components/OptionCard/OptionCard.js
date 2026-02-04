import './OptionCard.css'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  Box,

} from "@material-ui/core";

const OptionCard = ({stat, index})=>{
  return (
    <Grid onClick={stat.onClick} item xs={12} sm={6} md={4} key={index}>
      <Card 
        className="stat-card" 
        style={{ 
          height: '100%',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0',
          transition: 'all 0.2s ease'
        }}
      >
        <CardContent style={{ padding: '24px' }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="flex-start"
            mb={2} // margin-bottom: 16px
          >
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              width={48}
              height={48}
              borderRadius="10px"
              bgcolor="rgba(25, 118, 210, 0.1)"
              style={{
                flexShrink: 0,
                marginRight: '16px'
              }}
            >
              {stat.icon}
            </Box>
            
            <Typography 
              variant="h3" 
              style={{
                fontWeight: 700,
                fontSize: '2.5rem',
                lineHeight: 1,
                color: '#1a1a1a',
                margin: 0
              }}
            >
              {stat.value}
            </Typography>
          </Box>
          
          <Typography 
            variant="h6" 
            style={{
              fontWeight: 600,
              color: '#333',
              marginBottom: '4px',
              fontSize: '1.125rem'
            }}
            gutterBottom
          >
            {stat.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            style={{
              color: '#666',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              margin: 0
            }}
          >
            {stat.subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};


export default OptionCard;