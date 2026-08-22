import './App.css'
import { ConfigProvider } from 'antd'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Signup'
import Login from './authentication/Login'
import Dashboard from './dashboard'
import PatientList from './patientmangement/patientlist/patient-list'
import PrescPreview from './prescriptions/prescription-preview'

import Pharmacy from './suppliers/pharmacy'
import AddManualForm from './suppliers/add-manual-form'
import FillStockPage from './suppliers/fill-stock/fill-stock-page'
import Employees from './employees'
import AddEmployee from './employees/add-employee/add-employee'
import AuthGuard from './auth/authguard'
import CreateBed from './patientmangement/bedarrangement/roomtype'
import CreateRooms from './patientmangement/bedarrangement/rooms'
import BedStep3 from './patientmangement/bedarrangement/beds'
import FirstStep from './appointment-step/features/first-step-appointment'
import SecondStep from './appointment-step/features/second-step-appointment'
import Appointment from './appointment-step/appointment'
import PrescriptionDetails from './prescriptions/prescription-details'
import AddPrescription from './prescriptions/add-prescription'
import PrescriptionCheckout from './prescriptions/prescription-checkout'
import PrescriptionReceipt from './prescriptions/prescription-receipt'
import GeneralInfo from './patientmangement/singlepatientdetail/patient-profile'
import AddAppointment from './patientmangement/patient-appointment/addAppointment'
import AppointmentsPage from './patientmangement/patient-appointment/appointment-list'
import AppointmentDetails from './patientmangement/patient-appointment/appointment-details'
import UpdatePasswordPage from './authentication/update-password'
import MyProfilePage from './profile/my-profile'

function App() {

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#25D366',
          colorPrimaryHover: '#20b858',
          colorInfo: '#2563EB',
          colorSuccess: '#16A34A',
          colorWarning: '#D97706',
          colorError: '#DC2626',
          borderRadius: 8,
          fontFamily: "'Roboto', sans-serif",
        },
      }}
    >
      <div>
        <nav>

        </nav>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/dashboard' element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path='/update-password' element={<AuthGuard><UpdatePasswordPage /></AuthGuard>} />
          <Route path='/profile' element={<AuthGuard><MyProfilePage /></AuthGuard>} />

          {/* Patient — view */}
          <Route path='/patients' element={<AuthGuard module="patient" action="view"><PatientList /></AuthGuard>} />
          <Route path='/patients/patient-overview/:patientID' element={<AuthGuard module="patient" action="view"><GeneralInfo/></AuthGuard>} />
          <Route path='/patients/prescription-preview/:patientID' element={<AuthGuard module="patient" action="view"><PrescPreview /></AuthGuard>} />
          {/* Patient — create */}
          <Route path='/patients/add-patient' element={<AuthGuard module="patient" action="create"><Appointment /></AuthGuard>}>
            <Route index element={<FirstStep />} />
            <Route path=':patientID/step2' element={<SecondStep />} />
          </Route>

          {/* Appointment — view */}
          <Route path='/appointments' element={<AuthGuard module="appointment" action="view"><AppointmentsPage/></AuthGuard>} />
          <Route path='/appointment/preview/:appointmentID' element={<AuthGuard module="appointment" action="view"><AppointmentDetails /></AuthGuard>} />
          {/* Appointment — create */}
          <Route path='/patients/addappointment/:patientID' element={<AuthGuard module="appointment" action="create"><AddAppointment /></AuthGuard>} />

          {/* Medicine / suppliers — view */}
          <Route path='/suppliers' element={<AuthGuard module="medicine" action="view"><Pharmacy /></AuthGuard>} />
          <Route path='/suppliers/:supplierId/fill-stock' element={<AuthGuard module="medicine" action="update"><FillStockPage /></AuthGuard>} />
          {/* Medicine — create */}
          <Route path='/suppliers/add' element={<AuthGuard module="medicine" action="create"><AddManualForm /></AuthGuard>} />

          {/* Employee — view / create */}
          <Route path='/employees' element={<AuthGuard module="employee" action="view"><Employees /></AuthGuard>} />
          <Route path='/employees/add-employee' element={<AuthGuard module="employee" action="create"><AddEmployee /></AuthGuard>} />

          {/* Prescription — view / create */}
          <Route path='/prescription' element={<AuthGuard module="prescription" action="view"><PrescriptionDetails /></AuthGuard>} />
          <Route path='/prescription/add-prescription/:appointmentID' element={<AuthGuard module="prescription" action="create"><AddPrescription /></AuthGuard>} />
          <Route path='/prescription/:id/checkout' element={<AuthGuard module="prescription" action="view"><PrescriptionCheckout /></AuthGuard>} />
          <Route path='/prescription/:id/receipt' element={<AuthGuard module="prescription" action="view"><PrescriptionReceipt /></AuthGuard>} />
          <Route path='/prescription/:id' element={<AuthGuard module="prescription" action="view"><PrescPreview /></AuthGuard>} />

          <Route path='/bed-arrangement' element={<CreateBed />} />
          <Route path='/bed-arrangement/step-2' element={<CreateRooms />} />
          <Route path='/bed-arrangement/step-3' element={<BedStep3 />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}

export default App
