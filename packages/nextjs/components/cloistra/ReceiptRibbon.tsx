"use client";

import type { Address, Hex } from "viem";
import { CorridorReceipt, useReceiptFeed } from "~~/hooks/cloistra/useReceiptFeed";

const short = (a?: string, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "—");

/**
 * The hash-chained receipt ribbon. Each transfer stamps a seal-link with public ordering
 * and routing (sender → recipient at nonce N) — but NO amount, NO threshold, NO pass/fail
 * bit. Tamper-evident ordering you can watch grow. Click a receipt to open its transaction
 * on the explorer (gas, events, logs); in the officer view a click instead selects its
 * sealed outcome handle for lawful decryption.
 */
export function ReceiptRibbon({
  corridor,
  engine,
  mandateId,
  onSelect,
  selectedNonce,
}: {
  corridor?: Address;
  engine?: Address;
  mandateId?: Hex;
  onSelect?: (r: CorridorReceipt) => void;
  selectedNonce?: bigint;
}) {
  const { data: receipts, isLoading } = useReceiptFeed(corridor, engine, mandateId);

  return (
    <div className="ob-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="ob-mono text-[0.72rem] uppercase tracking-wider" style={{ color: "var(--ob-ink-dim)" }}>
          receipt ribbon · public ordering only
        </span>
        <span className="ob-chip">amounts &amp; rules sealed</span>
      </div>

      {isLoading ? (
        <div className="ob-mono text-sm py-6 text-center" style={{ color: "var(--ob-ink-faint)" }}>
          reading the chain…
        </div>
      ) : !receipts || receipts.length === 0 ? (
        <div className="ob-mono text-sm py-6 text-center" style={{ color: "var(--ob-ink-faint)" }}>
          no transfers yet — the ribbon grows as senders submit
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {receipts.map(r => {
            const selected = selectedNonce !== undefined && selectedNonce === r.nonce;
            const clickable = Boolean(onSelect && r.outcomeHandle);
            const txUrl = r.txHash ? `https://sepolia.etherscan.io/tx/${r.txHash}` : undefined;
            // Officer view: click the card to select it for audit. Everywhere else: click to open
            // the transfer on the explorer (gas, events, logs). Either way, a receipt is clickable.
            const onCardClick = clickable
              ? () => onSelect!(r)
              : txUrl
                ? () => window.open(txUrl, "_blank", "noopener,noreferrer")
                : undefined;
            return (
              <div
                key={`${r.txHash}-${r.nonce.toString()}`}
                onClick={onCardClick}
                role={onCardClick ? "button" : undefined}
                tabIndex={onCardClick ? 0 : undefined}
                onKeyDown={
                  onCardClick
                    ? e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCardClick();
                        }
                      }
                    : undefined
                }
                className={`shrink-0 text-left ob-card p-3 min-w-[190px] transition-all ${
                  onCardClick ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
                }`}
                style={selected ? { borderColor: "var(--ob-audit)" } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="ob-mono text-[0.68rem]" style={{ color: "var(--ob-ink-dim)" }}>
                    #{r.nonce.toString()}
                  </span>
                  <span className="ob-seal-text ob-mono text-[0.66rem]">⛓ {short(r.receipt ?? r.txHash, 3)}</span>
                </div>
                <div className="ob-mono text-[0.72rem] mt-1" style={{ color: "var(--ob-ink)" }}>
                  {short(r.sender)} → {short(r.recipient)}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="ob-mono text-[0.64rem]" style={{ color: "var(--ob-ink-faint)" }}>
                    {clickable ? (selected ? "selected for audit" : "click to audit") : "outcome sealed"}
                  </span>
                  {txUrl &&
                    (clickable ? (
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="ob-mono text-[0.64rem] ob-seal-text hover:underline"
                        title="view transaction — gas, events, logs"
                      >
                        tx ↗
                      </a>
                    ) : (
                      <span
                        className="ob-mono text-[0.64rem] ob-seal-text"
                        title="view transaction — gas, events, logs"
                      >
                        tx ↗
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
