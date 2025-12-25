import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './Login'
import Dashboard from './dashboard'
import Appointment from './appointment'
import PatientList from './patient-list'
import OverviewPatient from './patient-overview'
import PrescPreview from './prescription-preview'

import Pharmacy from './pharmacy/pharmacy'
import AddPharmacy from './pharmacy/add-pharmacy'
import Employees from './employees'
import AddEmployee from './add-employee'

function App() {

  return (
    <>
    <div>
      <nav>

      </nav>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path="/" element={<Navigate to="/login"/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/patients' element={<PatientList/>}/>
        <Route path='/patients/add-patient' element={<Appointment/>}/>
        <Route path='/patients/patient-overview/:patientID' element={<OverviewPatient/>}/>
        <Route path='/patients/prescription-preview/:patientID' element={<PrescPreview/>}/>
        <Route path='/pharmacy' element={<Pharmacy/>}>
          <Route path='add' element={<AddPharmacy/>}/>
        </Route>
        <Route path='/employees' element={<Employees/>}/>
        <Route path='/employees/add-employee' element={<AddEmployee/>}/>
      </Routes>
    </div>
    </>
  )
}

export default App
