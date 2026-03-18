import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylswdeykgaqithedsybr.supabase.co'
const supabaseAnonKey = 'sb_publishable_RLgUyU0bv9Wx0XtSg0Meeg_4XxUnmyP'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const hospitals = [
  {
    name: "Mahabalipuram Government Hospital",
    address: "Mahabalipuram, Tamil Nadu 603104",
    phone: "044 2744 2232",
    latitude: 12.6200,
    longitude: 80.1900
  },
  {
    name: "Sunrise Specialty Clinic",
    address: "ECR Road, near Five Rathas, Mahabalipuram",
    phone: "044 2744 3344",
    latitude: 12.6300,
    longitude: 80.2000
  },
  {
    name: "Coastline Medical Center",
    address: "Kovalam Road, Mahabalipuram",
    phone: "044 2744 5566",
    latitude: 12.6100,
    longitude: 80.1800
  },
  {
    name: "Shore Temple Health Point",
    address: "Shore Temple Road, Mahabalipuram",
    phone: "044 2744 7788",
    latitude: 12.6180,
    longitude: 80.1950
  },
  {
    name: "Heritage Care Hospital",
    address: "Poonjeri Junction, Mahabalipuram",
    phone: "044 2744 9900",
    latitude: 12.6400,
    longitude: 80.2100
  }
]

const doctors = [
  { name: "Rajesh Kumar", specialization: "General Physician", hospital_index: 0 },
  { name: "Priya Dharshini", specialization: "Surgeon", hospital_index: 0 },
  { name: "Anitha", specialization: "Dermatologist", hospital_index: 1 },
  { name: "Sanjay", specialization: "Surgeon", hospital_index: 1 },
  { name: "Vikram", specialization: "Cardiologist", hospital_index: 2 },
  { name: "Meena", specialization: "General Physician", hospital_index: 2 },
  { name: "Gopi", specialization: "Orthopedic", hospital_index: 3 },
  { name: "Lakshmi", specialization: "General Physician", hospital_index: 3 },
  { name: "Suresh", specialization: "Pediatrician", hospital_index: 4 },
  { name: "Kavitha", specialization: "Surgeon", hospital_index: 4 }
]

async function seed() {
  console.log('--- Seeding Mahabalipuram Hospitals & Doctors ---')

  await supabase.from('appointments').delete().neq('id', 0)
  await supabase.from('doctors').delete().neq('id', 0)
  await supabase.from('hospitals').delete().neq('id', 0)

  const { data: insertedHospitals, error: hError } = await supabase
    .from('hospitals')
    .insert(hospitals)
    .select()

  if (hError) {
    console.error('Error inserting hospitals:', hError)
    return
  }
  console.log(`Inserted ${insertedHospitals.length} hospitals.`)

  const docsToInsert = doctors.map(d => ({
    name: d.name,
    specialization: d.specialization,
    hospital_id: insertedHospitals[d.hospital_index].id,
    phone: '0000000000',
    password: 'doctor123'
  }))

  const { data: insertedDoctors, error: dError } = await supabase
    .from('doctors')
    .insert(docsToInsert)
    .select()

  if (dError) {
    console.error('Error inserting doctors:', dError)
    return
  }
  console.log(`Inserted ${insertedDoctors.length} doctors.`)
  console.log('--- Seeding Complete ---')
}

seed()
