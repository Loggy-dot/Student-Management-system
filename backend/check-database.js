const sqlite3 = require('sqlite3').verbose();

// Open the existing database
const db = new sqlite3.Database('students.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to existing database');
    checkTables();
  }
});

function checkTables() {
  // Check what tables exist
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      return;
    }
    
    console.log('\n=== EXISTING TABLES ===');
    tables.forEach(table => {
      console.log('Table:', table.name);
    });
    
    // Check students table structure
    if (tables.some(t => t.name === 'students')) {
      db.all("PRAGMA table_info(students)", (err, columns) => {
        if (err) {
          console.error('Error getting students columns:', err.message);
        } else {
          console.log('\n=== STUDENTS TABLE COLUMNS ===');
          columns.forEach(col => {
            console.log(`${col.name} (${col.type})`);
          });
        }
        
        // Check some sample data
        db.all("SELECT * FROM students LIMIT 3", (err, rows) => {
          if (err) {
            console.error('Error getting sample data:', err.message);
          } else {
            console.log('\n=== SAMPLE STUDENTS DATA ===');
            console.log(rows);
          }
          db.close();
        });
      });
    } else {
      console.log('No students table found');
      db.close();
    }
  });
}
