import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CheckOutlined, RightOutlined } from '@ant-design/icons';

import './swipe-to-confirm.css';

const COMPLETE_RATIO = 0.85;

export interface SwipeToConfirmProps {
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    /** Reset thumb when this becomes false (e.g. modal closed). */
    active?: boolean;
}

export default function SwipeToConfirm({
    label = 'Swipe to mark paid',
    disabled = false,
    loading = false,
    onConfirm,
    active = true,
}: SwipeToConfirmProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const startOffsetRef = useRef(0);
    const offsetRef = useRef(0);
    const confirmedRef = useRef(false);

    const [offset, setOffset] = useState(0);
    const [maxTravel, setMaxTravel] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [completed, setCompleted] = useState(false);

    const labelId = useId();
    const isInteractive = !disabled && !loading && !completed;

    const measure = () => {
        const track = trackRef.current;
        if (!track) return;
        const thumb = track.querySelector('.swipe-confirm-thumb') as HTMLElement | null;
        const thumbW = thumb?.offsetWidth ?? 48;
        setMaxTravel(Math.max(0, track.clientWidth - thumbW - 8));
    };

    useEffect(() => {
        measure();
        const track = trackRef.current;
        if (!track || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => measure());
        ro.observe(track);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!active) {
            draggingRef.current = false;
            confirmedRef.current = false;
            offsetRef.current = 0;
            setOffset(0);
            setDragging(false);
            setCompleted(false);
        }
    }, [active]);

    const wasLoadingRef = useRef(false);
    useEffect(() => {
        // After a failed confirm, loading goes false while modal stays open — allow retry.
        if (wasLoadingRef.current && !loading && active && completed) {
            confirmedRef.current = false;
            offsetRef.current = 0;
            setOffset(0);
            setCompleted(false);
        }
        wasLoadingRef.current = loading;
    }, [loading, active, completed]);

    const finishConfirm = () => {
        if (confirmedRef.current || disabled || loading) return;
        confirmedRef.current = true;
        setCompleted(true);
        setOffset(maxTravel);
        offsetRef.current = maxTravel;
        onConfirm();
    };

    const clamp = (value: number) => Math.min(Math.max(0, value), maxTravel);

    const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
        if (!isInteractive || maxTravel <= 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        draggingRef.current = true;
        startXRef.current = e.clientX;
        startOffsetRef.current = offsetRef.current;
        setDragging(true);
    };

    const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
        if (!draggingRef.current) return;
        const next = clamp(startOffsetRef.current + (e.clientX - startXRef.current));
        offsetRef.current = next;
        setOffset(next);
    };

    const onPointerUp = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setDragging(false);
        if (offsetRef.current >= maxTravel * COMPLETE_RATIO) {
            finishConfirm();
            return;
        }
        offsetRef.current = 0;
        setOffset(0);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finishConfirm();
        }
    };

    const progress = maxTravel > 0 ? offset / maxTravel : 0;
    const fillWidth = Math.max(offset + 24, completed ? maxTravel + 48 : 0);

    return (
        <div
            ref={trackRef}
            className={`swipe-confirm ${dragging ? 'swipe-confirm--dragging' : ''} ${
                completed || loading ? 'swipe-confirm--done' : ''
            } ${disabled ? 'swipe-confirm--disabled' : ''}`}
            role="slider"
            tabIndex={isInteractive ? 0 : -1}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={completed || loading ? 'Payment confirmed' : label}
            aria-labelledby={labelId}
            aria-disabled={!isInteractive}
            onKeyDown={onKeyDown}
        >
            <div className="swipe-confirm-fill" style={{ width: fillWidth }} />
            <span id={labelId} className="swipe-confirm-label">
                {loading ? 'Confirming…' : completed ? 'Marked as paid' : label}
            </span>
            <button
                type="button"
                className="swipe-confirm-thumb"
                style={{ transform: `translateX(${offset}px)` }}
                disabled={!isInteractive}
                aria-hidden
                tabIndex={-1}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {completed || loading ? <CheckOutlined /> : <RightOutlined />}
            </button>
        </div>
    );
}
