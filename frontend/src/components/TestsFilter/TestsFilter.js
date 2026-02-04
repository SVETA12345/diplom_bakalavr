import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Paper,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import SubjectIcon from '@material-ui/icons/Subject';

const TestsFilter = ({classes, searchQuery, setSearchQuery, showFilters, setShowFilters, clearFilters, selectedSubject, dateFilter, setSelectedSubject, subjects, setDateFilter }) => {
    return (
      <Paper className={classes.filtersPaper}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Фильтры
            </Button>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              disabled={!searchQuery && selectedSubject === 'all' && !dateFilter}
              size="small"
            >
              Сбросить
            </Button>
          </Grid>
        </Grid>

        {/* Расширенные фильтры */}
        {showFilters && (
          <Box mt={3} pt={2} borderTop="1px solid #e0e0e0">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Предмет</InputLabel>
                  <Select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    label="Предмет"
                    startAdornment={
                      <InputAdornment position="start">
                        <SubjectIcon />
                      </InputAdornment>
                    }
                  >
                    {subjects.map((subject, index) => (
                      <MenuItem key={index} value={subject === 'Все предметы' ? 'all' : subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Дата создания"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    )
}

export default TestsFilter;