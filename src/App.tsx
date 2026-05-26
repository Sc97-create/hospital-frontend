import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './authentication/Login'
import Dashboard from './dashboard'
import PatientList from './patientmangement/patientlist/patient-list'
import PrescPreview from './prescriptions/prescription-preview'

import Pharmacy from './suppliers/pharmacy'
import AddManualForm from './suppliers/add-manual-form'
import Employees from './employees'
import AddEmployee from './employees/add-employee/add-employee'
import AuthGuard from './auth/authguard'
import AddPermission from './employees/add-permissions/add-permission'
import CreateBed from './patientmangement/bedarrangement/roomtype'
import CreateRooms from './patientmangement/bedarrangement/rooms'
import BedStep3 from './patientmangement/bedarrangement/beds'
import FirstStep from './appointment-step/features/first-step-appointment'
import SecondStep from './appointment-step/features/second-step-appointment'
import ThirdStep from './signup-step/features/third-step/third-step'
import PreviewAppointment from './appointment-step/features/third-step-appointment'
import Appointment from './appointment-step/appointment'
import PrescriptionDetails from './prescriptions/prescription-details'
import AddPrescription from './prescriptions/add-prescription'
import GeneralInfo from './patientmangement/singlepatientdetail/patient-profile'

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
          <Route path='/patients/add-patient' element={<AuthGuard><Appointment /></AuthGuard>}>
            <Route index element={<FirstStep />} />
            <Route path=':patientID/step2' element={<SecondStep />} />
          </Route>
          <Route path='/patients/patient-overview/:patientID' element={<AuthGuard><GeneralInfo/></AuthGuard>} />
          <Route path='/patients/prescription-preview/:patientID' element={<AuthGuard> <PrescPreview /> </AuthGuard>} />
          <Route path='/suppliers' element={<AuthGuard><Pharmacy /> </AuthGuard>}></Route>
          <Route path='/suppliers/add' element={<AuthGuard><AddManualForm /></AuthGuard>} />
          <Route path='/employees' element={<AuthGuard> <Employees /> </AuthGuard>} />
          <Route path='/employees/add-employee' element={<AuthGuard><AddEmployee /></AuthGuard>} />
          <Route path='/prescription' element={<AuthGuard><PrescriptionDetails /> </AuthGuard>} />
          <Route path='/prescription/add-prescription/:id' element={<AuthGuard><AddPrescription /></AuthGuard>} />
          <Route path='/prescription/:id' element={<AuthGuard><PrescPreview /></AuthGuard>} />
          <Route path='/bed-arrangement' element={<CreateBed />} />
          <Route path='/bed-arrangement/step-2' element={<CreateRooms />} />
          <Route path='/bed-arrangement/step-3' element={<BedStep3 />} />
        </Routes>
      </div>
    </>
  )
}

export default App
