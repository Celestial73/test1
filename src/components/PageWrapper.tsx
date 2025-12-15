import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

export function PageWrapper({ children }: PropsWithChildren) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
                width: '100%',
                minHeight: '100vh',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: 'var(--tgui--bg_color)'
            }}
        >
            {children}
        </motion.div>
    );
}
