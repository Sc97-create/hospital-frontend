import SolutionPlaceholder from './solution-placeholder'

export default function ClinicManagementPage() {
  return (
    <SolutionPlaceholder
      eyebrow="Solutions"
      title="Clinic Management"
      blocks={[
        {
          id: 'clinic-story-1',
          imageSrc: '/landing/story1.png',
          imageLabel: 'Manual clinic journey',
          title: "A clinic visit shouldn't end when the patient walks out.",
          description: [
            'Today, many clinic processes still depend on paper and manual coordination.',
            'A patient visits the clinic. The appointment is written down, the doctor writes a prescription, and follow-ups are tracked manually. When the patient needs to return, staff often have to search through records and make calls themselves.',
          ],
          bottomMessage:
            'The patient leaves, but the work continues — across registers, paper and phone calls.',
          flow: 'Patient arrives → Paperwork → Prescription → Manual follow-up → Information gets disconnected',
        },
        {
          id: 'clinic-story-2',
          imageSrc: '/landing/story2.png',
          imageLabel: 'Connected clinic journey',
          title: 'What if the entire visit moved as one connected workflow?',
          description: [
            'Floato connects the steps of a clinic visit so information can move from one team to the next.',
            'The patient record and appointment are created once. The doctor adds the prescription, the pharmacy can prepare the medicines in advance, and the patient can collect them using a simple code.',
          ],
          bottomMessage: 'One patient. One connected journey. Less manual coordination.',
          flow: 'Patient → Patient record → Appointment → Doctor → Pharmacy → Medicine — Everything is connected.',
        },
      ]}
      difference={{
        title: 'When everything is connected, time is no longer spent connecting the pieces.',
        beforeLabel: 'Instead of staff repeatedly:',
        beforeFlow: 'Writing → Searching → Calling → Checking → Re-entering',
        afterLabel: 'the workflow becomes:',
        afterFlow: 'Create → Connect → Continue',
        meansLabel: 'This means:',
        benefits: [
          {
            title: 'Less paperwork',
            body: "Patient information doesn't need to be repeatedly written down.",
          },
          {
            title: 'Less coordination',
            body: 'The next person in the workflow already has the information they need.',
          },
          {
            title: 'Less waiting',
            body: 'The pharmacy can prepare medicines while the patient completes the visit.',
          },
          {
            title: 'Better visibility',
            body: "The clinic can see the patient's visit and related activities in one place.",
          },
        ],
      }}
    />
  )
}
