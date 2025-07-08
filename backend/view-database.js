const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'students.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Student Database Contents\n');

// View all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error(err.message);
        return;
    }
    
    console.log('📋 Available Tables:');
    tables.forEach(table => console.log(`  - ${table.name}`));
    console.log('\n');
    
    // View students_report data
    console.log('👥 Students Report:');
    console.log('='.repeat(80));
    db.all("SELECT * FROM students_report", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        
        if (rows.length === 0) {
            console.log('No data found in students_report table');
        } else {
            console.table(rows);
        }
        
        // View departments
        console.log('\n🏢 Departments:');
        console.log('='.repeat(50));
        db.all("SELECT * FROM departments", [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            
            if (rows.length === 0) {
                console.log('No departments found');
            } else {
                console.table(rows);
            }
            
            // View courses
            console.log('\n📚 Courses:');
            console.log('='.repeat(50));
            db.all("SELECT * FROM courses", [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                
                if (rows.length === 0) {
                    console.log('No courses found');
                } else {
                    console.table(rows);
                }
                
                // View students_report_update
                console.log('\n📈 Students Report Update:');
                console.log('='.repeat(60));
                db.all("SELECT * FROM students_report_update", [], (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }
                    
                    if (rows.length === 0) {
                        console.log('No data found in students_report_update table');
                    } else {
                        console.table(rows);
                    }
                    
                    db.close();
                });
            });
        });
    });
});