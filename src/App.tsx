import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './authentication/Login'
import Dashboard from './dashboard'
import Appointment from './appointment'
import PatientList from './patient-list'
import OverviewPatient from './patient-overview'
import PrescPreview from './prescription-preview'

import Pharmacy from './pharmacy/pharmacy'
import AddPharmacy from './pharmacy/add-pharmacy'
import Employees from './employees'
import AddEmployee from './employees/add-employee/add-employee'
import AuthGuard from './auth/authguard'
import AddPermission from './employees/add-permissions/add-permission'
import CreateBed from './patientmangement/bedarrangement/roomtype'
import CreateRooms from './patientmangement/bedarrangement/rooms'
import BedStep3 from './patientmangement/bedarrangement/beds'

function App() {

  return (
    <>
      <div>
        <nav>

        </nav>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/dashboard' element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path='/patients' element={<AuthGuard><PatientList /> </AuthGuard>} />
          <Route path='/patients/add-patient' element={<AuthGuard><Appointment /></AuthGuard>} />
          <Route path='/patients/patient-overview/:patientID' element={<AuthGuard><OverviewPatient /></AuthGuard>} />
          <Route path='/patients/prescription-preview/:patientID' element={<AuthGuard> <PrescPreview /> </AuthGuard>} />
          <Route path='/pharmacy' element={<AuthGuard><Pharmacy /> </AuthGuard>}>
            <Route path='add' element={<AuthGuard><AddPharmacy /></AuthGuard>} />
          </Route>
          <Route path='/employees' element={<AuthGuard> <Employees /> </AuthGuard>} />
          <Route path='/employees/add-employee' element={<AuthGuard><AddEmployee /></AuthGuard>} />
          <Route path='/bed-arrangement' element={<CreateBed />} />
          <Route path='/bed-arrangement/step-2' element={<CreateRooms />} />
          <Route path='/bed-arrangement/step-3' element={<BedStep3 />} />
        </Routes>
      </div>
    </>
  )
}

export default App
