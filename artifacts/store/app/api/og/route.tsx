import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Göçmen Perde";
  const price = searchParams.get("price");
  const category = searchParams.get("category");
  const imageUrl = searchParams.get("image");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "linear-gradient(135deg, #FAF7F2 0%, #F0EBE3 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Left decorative strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "8px",
            height: "630px",
            background: "linear-gradient(180deg, #D4AF5A 0%, #B8973E 100%)",
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "60px 70px",
            gap: "50px",
            alignItems: "center",
          }}
        >
          {/* Text block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "20px",
            }}
          >
            {/* Logo / brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#B8973E",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                }}
              >
                GÖÇMEN PERDE
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                BURSA · EST. 1993
              </span>
            </div>

            {/* Category badge */}
            {category && (
              <div
                style={{
                  display: "flex",
                  background: "#F0EBE3",
                  border: "1.5px solid #D4AF5A",
                  borderRadius: "999px",
                  padding: "6px 18px",
                  width: "fit-content",
                }}
              >
                <span
                  style={{ fontSize: "13px", color: "#B8973E", fontWeight: 700 }}
                >
                  {category}
                </span>
              </div>
            )}

            {/* Product title */}
            <div
              style={{
                fontSize: title.length > 40 ? "36px" : "46px",
                fontWeight: 900,
                color: "#18181B",
                lineHeight: 1.15,
                maxWidth: "580px",
              }}
            >
              {title}
            </div>

            {/* Price */}
            {price && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <span
                  style={{
                    fontSize: "42px",
                    fontWeight: 900,
                    color: "#B8973E",
                  }}
                >
                  ₺{price}
                </span>
                <span style={{ fontSize: "16px", color: "#9CA3AF" }}>
                  güvenli alışveriş
                </span>
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                display: "flex",
                background: "#18181B",
                borderRadius: "14px",
                padding: "14px 28px",
                width: "fit-content",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.5px",
                }}
              >
                gocmenkirtasiye.com.tr
              </span>
            </div>
          </div>

          {/* Product image */}
          {imageUrl && (
            <div
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "24px",
                overflow: "hidden",
                border: "3px solid #E8E0D5",
                flexShrink: 0,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "8px",
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #D4AF5A 0%, #B8973E 50%, transparent 100%)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
