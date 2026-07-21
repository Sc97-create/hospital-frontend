import { Tag } from 'antd';
import type { TagProps } from 'antd';
import type { StatusType } from '../constants/status-colors';
import { statusTagClassName } from '../constants/status-colors';

export interface StatusTagProps extends Omit<TagProps, 'color'> {
    type: StatusType;
}

/** Tag that only renders one of the four global status colors. Never pass `color`. */
export function StatusTag({
    type,
    className,
    bordered = true,
    children,
    ...rest
}: StatusTagProps) {
    return (
        <Tag bordered={bordered} className={statusTagClassName(type, className)} {...rest}>
            {children}
        </Tag>
    );
}
