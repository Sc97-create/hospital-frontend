import { Steps } from 'antd';

const { Step } = Steps;

interface BedArrangementStepsProps {
    current: number;
}

export default function BedArrangementSteps({ current }: BedArrangementStepsProps) {
    return (
        <div style={{ padding: 8 }}>
            <Steps current={current} size="small" style={{ maxWidth: 500 }}>
                <Step title="Room Types" />
                <Step title="Rooms" />
                <Step title="Beds" />
            </Steps>
        </div>
    );
}
